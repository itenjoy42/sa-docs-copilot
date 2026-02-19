# 구현 계획: SA 산출물 Co-Pilot

## 개요

이 구현 계획은 SA 산출물 자동 생성 웹 애플리케이션을 단계별로 구축하는 과정을 안내합니다. React 프론트엔드와 Node.js/Express 백엔드를 구축하며, 각 단계는 이전 단계를 기반으로 점진적으로 기능을 추가합니다.

## 태스크

- [x] 1. 프로젝트 초기 설정 및 디렉토리 구조 생성
  - frontend/ 및 backend/ 디렉토리 생성
  - package.json 파일 생성 및 필요한 의존성 설치
  - 기본 환경 변수 설정 (.env 파일)
  - _Requirements: 8.1, 8.2_

- [ ] 2. Backend 핵심 서비스 구현
  - [x] 2.1 Template Manager 서비스 구현
    - JSON 템플릿 파일 로드 기능
    - 템플릿 검증 로직
    - 3가지 MVP 산출물 타입의 템플릿 JSON 파일 생성
    - _Requirements: 5.1, 5.2, 2.1_
  
  - [x] 2.2 Validator 서비스 구현
    - 입력 데이터 검증 로직 (필수 필드 확인)
    - 산출물 필수 섹션 검증 로직
    - Markdown 형식 유효성 검증
    - _Requirements: 1.3, 1.4, 4.1, 2.5_
  
  - [x] 2.3 Draft Generator 서비스 구현
    - LLM 프롬프트 생성 로직
    - 데모 모드 샘플 콘텐츠 생성 로직
    - LLM 서비스 호출 로직 (선택적)
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [x] 2.4 File Manager 서비스 구현
    - 산출물 파일 저장 기능 (outputs 디렉토리)
    - 고유 파일명 생성 로직
    - 파일 로드 기능
    - _Requirements: 3.2, 3.5_

- [ ] 3. Backend API 엔드포인트 구현
  - [x] 3.1 POST /api/generate 엔드포인트
    - 요청 데이터 검증
    - Draft Generator 호출하여 산출물 생성
    - 생성된 산출물 검증 및 경고 생성
    - 응답 반환 (성공/오류)
    - _Requirements: 7.1, 2.1, 2.2, 2.5, 4.1_
  
  - [x] 3.2 POST /api/save 엔드포인트
    - 산출물 저장 요청 처리
    - File Manager 호출하여 파일 저장
    - 저장된 파일 정보 반환
    - _Requirements: 3.2, 3.5_
  
  - [x] 3.3 GET /api/download/:filename 엔드포인트
    - 파일 존재 여부 확인
    - 파일 내용 읽기 및 다운로드 응답 반환
    - 적절한 Content-Type 헤더 설정
    - _Requirements: 3.3, 7.2_
  
  - [x] 3.4 GET /api/templates 엔드포인트
    - 사용 가능한 템플릿 목록 반환
    - _Requirements: 5.2_
  
  - [x] 3.5 전역 오류 처리 미들웨어 추가
    - 모든 API 오류에 대한 일관된 응답 형식
    - 내부 오류 세부사항 노출 방지
    - _Requirements: 7.3, 7.4_

- [ ] 4. Frontend 핵심 컴포넌트 구현
  - [x] 4.1 App 컴포넌트 및 전역 상태 관리
    - 전역 레이아웃 구성 (헤더, 푸터)
    - 상태 관리 (formData, generatedDraft, isLoading, errors, warnings)
    - API 호출 핸들러 (생성, 저장, 다운로드, 복사)
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 4.2 InputForm 컴포넌트
    - 입력 필드 UI (프로젝트 요약, 핵심 요구사항, 문서 톤, 산출물 타입)
    - 실시간 입력 검증 및 오류 표시5
    - 제출 버튼 및 폼 제출 처리
    - 보안 경고 문구 표시
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1_
  
  - [x] 4.3 DraftPreview 컴포넌트
    - Markdown 콘텐츠 렌더링
    - 품질 경고 메시지 표시
    - 액션 버튼 (저장, 다운로드, 복사, 재생성)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 4.4_
  
  - [x] 4.4 LoadingSpinner 및 오류 알림 컴포넌트
    - 로딩 인디케이터 UI
    - 오류/경고 알림 UI
    - _Requirements: 8.4, 8.5_

- [x] 5. Frontend API 서비스 레이어 구현
  - Axios 기반 API 호출 함수
  - 오류 처리 및 재시도 로직
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 6. 스타일링 및 반응형 디자인 적용
  - Tailwind CSS 설정 및 커스텀 유틸리티 클래스
  - 모바일/데스크탑 반응형 레이아웃
  - Noto Sans KR 폰트 적용
  - 로고 및 푸터 추가
  - _Requirements: 8.2, 8.3_

- [x] 7. 통합 및 연결
  - Frontend와 Backend 연결 확인
  - CORS 설정
  - 환경 변수 최종 확인
  - _Requirements: 7.1, 7.2_

- [x] 8. 최종 검증 및 사용자 확인
  - 모든 기능이 정상 동작하는지 확인
  - 사용자에게 질문이 있으면 확인

## 참고사항

- 각 태스크는 이전 태스크를 기반으로 구축됩니다
- Backend 서비스를 먼저 구현한 후 API 엔드포인트를 구현합니다
- Frontend는 Backend API가 준비된 후 구현합니다
- 모든 코드는 한국어 주석을 포함합니다
- 테스트 관련 태스크는 사용자 요청에 따라 제외되었습니다
