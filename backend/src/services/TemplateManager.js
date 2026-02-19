import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Template Manager 서비스
 * JSON 템플릿 파일을 로드하고 검증하는 기능을 제공합니다.
 */
class TemplateManager {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
  }

  /**
   * 특정 산출물 타입의 템플릿을 로드합니다.
   * @param {string} deliverableType - 산출물 타입 (예: 'type1', 'type2', 'type3')
   * @returns {Promise<Object>} 템플릿 객체
   * @throws {Error} 템플릿 파일을 찾을 수 없거나 유효하지 않은 경우
   */
  async loadTemplate(deliverableType) {
    try {
      const templatePath = path.join(this.templatesDir, `${deliverableType}.json`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = JSON.parse(templateContent);
      
      // 템플릿 검증
      this.validateTemplate(template);
      
      return template;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`템플릿을 찾을 수 없습니다: ${deliverableType}`);
      }
      throw error;
    }
  }

  /**
   * 사용 가능한 모든 템플릿 목록을 조회합니다.
   * @returns {Promise<Array>} 템플릿 목록 [{type, name}, ...]
   */
  async listTemplates() {
    try {
      const files = await fs.readdir(this.templatesDir);
      const templates = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(this.templatesDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const template = JSON.parse(templateContent);
          
          templates.push({
            type: template.type,
            name: template.name
          });
        }
      }

      return templates;
    } catch (error) {
      throw new Error(`템플릿 목록 조회 실패: ${error.message}`);
    }
  }

  /**
   * 템플릿의 유효성을 검증합니다.
   * @param {Object} template - 검증할 템플릿 객체
   * @throws {Error} 템플릿이 유효하지 않은 경우
   */
  validateTemplate(template) {
    // 필수 필드 확인
    if (!template.type) {
      throw new Error('템플릿에 type 필드가 없습니다.');
    }
    if (!template.name) {
      throw new Error('템플릿에 name 필드가 없습니다.');
    }
    if (!Array.isArray(template.commonSections)) {
      throw new Error('템플릿에 commonSections 배열이 없습니다.');
    }
    if (!Array.isArray(template.specificSections)) {
      throw new Error('템플릿에 specificSections 배열이 없습니다.');
    }
    if (!Array.isArray(template.rules)) {
      throw new Error('템플릿에 rules 배열이 없습니다.');
    }

    // 섹션 구조 검증
    const validateSections = (sections, sectionType) => {
      sections.forEach((section, index) => {
        if (!section.title) {
          throw new Error(`${sectionType}[${index}]에 title이 없습니다.`);
        }
        if (typeof section.required !== 'boolean') {
          throw new Error(`${sectionType}[${index}]에 required 필드가 없거나 boolean이 아닙니다.`);
        }
        if (!section.description) {
          throw new Error(`${sectionType}[${index}]에 description이 없습니다.`);
        }
      });
    };

    validateSections(template.commonSections, 'commonSections');
    validateSections(template.specificSections, 'specificSections');
  }
}

export default TemplateManager;
