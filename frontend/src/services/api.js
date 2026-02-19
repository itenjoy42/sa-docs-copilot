import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:5000/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 오류 메시지 변환 함수
const getErrorMessage = (error) => {
  if (error.response) {
    // 서버가 응답을 반환한 경우
    const { data } = error.response;
    return data.error || '서버 오류가 발생했습니다.';
  } else if (error.request) {
    // 요청이 전송되었지만 응답을 받지 못한 경우
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
  } else if (error.code === 'ECONNABORTED') {
    // 타임아웃
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  } else {
    // 기타 오류
    return '알 수 없는 오류가 발생했습니다.';
  }
};

// 재시도 로직을 포함한 API 호출 함수
const apiCallWithRetry = async (apiCall, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // 재시도 가능한 오류인지 확인
      const shouldRetry = 
        attempt < maxRetries && 
        (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED');
      
      if (!shouldRetry) {
        break;
      }
      
      // 재시도 전 대기 (지수 백오프)
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * 산출물 초안 생성 API
 * @param {Object} formData - 사용자 입력 데이터
 * @param {string} formData.projectSummary - 프로젝트 요약
 * @param {string} formData.coreRequirements - 핵심 요구사항
 * @param {string} formData.documentTone - 문서 톤 (formal|technical|concise)
 * @param {string} formData.deliverableType - 산출물 타입 (type1|type2|type3)
 * @param {boolean} useLLM - LLM 사용 여부 (기본값: true)
 * @returns {Promise<Object>} 생성된 산출물과 경고 메시지
 */
export const generateDraft = async (formData, useLLM = true) => {
  try {
    const response = await apiCallWithRetry(async () => {
      return await apiClient.post('/generate', {
        ...formData,
        useLLM,
      });
    });
    
    if (response.data.success) {
      return {
        draft: response.data.draft,
        warnings: response.data.warnings || [],
      };
    } else {
      throw new Error(response.data.error || '산출물 생성에 실패했습니다.');
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    
    // 검증 오류가 있는 경우
    if (error.response?.data?.validationErrors) {
      const validationError = new Error(errorMessage);
      validationError.validationErrors = error.response.data.validationErrors;
      throw validationError;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * 산출물 서버 저장 API
 * @param {Object} saveData - 저장할 데이터
 * @param {string} saveData.content - Markdown 콘텐츠
 * @param {string} saveData.deliverableType - 산출물 타입
 * @param {Object} saveData.metadata - 메타데이터
 * @returns {Promise<Object>} 저장된 파일 정보
 */
export const saveDraft = async (saveData) => {
  try {
    const response = await apiCallWithRetry(async () => {
      return await apiClient.post('/save', saveData);
    });
    
    if (response.data.success) {
      return {
        filename: response.data.filename,
        path: response.data.path,
      };
    } else {
      throw new Error(response.data.error || '저장에 실패했습니다.');
    }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * 산출물 다운로드 API
 * @param {string} filename - 다운로드할 파일명
 * @returns {Promise<Blob>} 파일 Blob
 */
export const downloadDraft = async (filename) => {
  try {
    const response = await apiCallWithRetry(async () => {
      return await apiClient.get(`/download/${filename}`, {
        responseType: 'blob',
      });
    });
    
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * 템플릿 목록 조회 API
 * @returns {Promise<Array>} 템플릿 목록
 */
export const getTemplates = async () => {
  try {
    const response = await apiCallWithRetry(async () => {
      return await apiClient.get('/templates');
    });
    
    return response.data.templates || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const apiService = {
  generateDraft,
  saveDraft,
  downloadDraft,
  getTemplates,
};

export default apiService;
