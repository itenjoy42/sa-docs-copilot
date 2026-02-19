import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * File Manager 서비스
 * 산출물 파일의 저장, 로드, 관리 기능을 제공합니다.
 */
class FileManager {
  constructor() {
    this.outputsDir = path.join(__dirname, '../outputs');
  }

  /**
   * 산출물을 파일로 저장합니다.
   * @param {string} content - 저장할 Markdown 콘텐츠
   * @param {Object} metadata - 산출물 메타데이터
   * @param {string} metadata.deliverableType - 산출물 타입
   * @param {string} metadata.projectSummary - 프로젝트 요약
   * @param {string} metadata.coreRequirements - 핵심 요구사항
   * @param {string} metadata.documentTone - 문서 톤
   * @param {boolean} metadata.usedLLM - LLM 사용 여부
   * @returns {Promise<Object>} 저장 결과 {filename, path}
   */
  async saveDraft(content, metadata) {
    try {
      // 고유 파일명 생성
      const filename = this.generateUniqueFilename(metadata.deliverableType);
      const filePath = path.join(this.outputsDir, filename);

      // 메타데이터를 포함한 전체 콘텐츠 생성
      const fullContent = this.createFileContent(content, metadata);

      // 파일 저장
      await fs.writeFile(filePath, fullContent, 'utf-8');

      return {
        filename,
        path: `/outputs/${filename}`
      };
    } catch (error) {
      throw new Error(`파일 저장 실패: ${error.message}`);
    }
  }

  /**
   * 저장된 산출물 파일을 로드합니다.
   * @param {string} filename - 로드할 파일명
   * @returns {Promise<string>} 파일 콘텐츠
   */
  async loadDraft(filename) {
    try {
      const filePath = path.join(this.outputsDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`파일을 찾을 수 없습니다: ${filename}`);
      }
      throw new Error(`파일 로드 실패: ${error.message}`);
    }
  }

  /**
   * 산출물 타입과 타임스탬프를 기반으로 고유한 파일명을 생성합니다.
   * @param {string} deliverableType - 산출물 타입
   * @returns {string} 생성된 파일명 (예: type1_20250115_103045.md)
   */
  generateUniqueFilename(deliverableType) {
    const now = new Date();
    
    // YYYYMMDD_HHMMSS 형식의 타임스탬프 생성
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    
    return `${deliverableType}_${timestamp}.md`;
  }

  /**
   * 저장된 산출물 파일 목록을 조회합니다.
   * @returns {Promise<Array>} 파일 목록 [{filename, createdAt, deliverableType}, ...]
   */
  async listDrafts() {
    try {
      const files = await fs.readdir(this.outputsDir);
      const drafts = [];

      for (const file of files) {
        // .md 파일만 필터링
        if (file.endsWith('.md')) {
          const filePath = path.join(this.outputsDir, file);
          const stats = await fs.stat(filePath);
          
          // 파일명에서 산출물 타입 추출 (예: type1_20250115_103045.md -> type1)
          const deliverableType = file.split('_')[0];
          
          drafts.push({
            filename: file,
            createdAt: stats.mtime,
            deliverableType
          });
        }
      }

      // 생성 시간 기준 내림차순 정렬 (최신 파일이 먼저)
      drafts.sort((a, b) => b.createdAt - a.createdAt);

      return drafts;
    } catch (error) {
      throw new Error(`파일 목록 조회 실패: ${error.message}`);
    }
  }

  /**
   * 메타데이터를 포함한 전체 파일 콘텐츠를 생성합니다.
   * @param {string} content - Markdown 콘텐츠
   * @param {Object} metadata - 메타데이터
   * @returns {string} 메타데이터가 포함된 전체 콘텐츠
   */
  createFileContent(content, metadata) {
    const metadataSection = `---
생성 일시: ${new Date().toLocaleString('ko-KR')}
산출물 타입: ${metadata.deliverableType}
문서 톤: ${metadata.documentTone}
LLM 사용: ${metadata.usedLLM ? '예' : '아니오'}
---

`;

    return metadataSection + content;
  }
}

export default FileManager;
