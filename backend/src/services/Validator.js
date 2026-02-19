/**
 * Validator 서비스
 * 입력 데이터와 생성된 산출물의 유효성을 검증하는 기능을 제공합니다.
 */
class Validator {
  /**
   * 사용자 입력 데이터의 유효성을 검증합니다.
   * @param {Object} formData - 검증할 입력 데이터
   * @param {string} formData.projectSummary - 프로젝트 요약
   * @param {string} formData.coreRequirements - 핵심 요구사항
   * @param {string} formData.documentTone - 문서 톤
   * @param {string} formData.deliverableType - 산출물 타입
   * @returns {Object} 검증 결과 {isValid: boolean, errors: Object}
   */
  validateInput(formData) {
    const errors = {};

    // 필수 필드 확인
    if (!formData.projectSummary || formData.projectSummary.trim() === '') {
      errors.projectSummary = '프로젝트 요약은 필수입니다.';
    }

    if (!formData.coreRequirements || formData.coreRequirements.trim() === '') {
      errors.coreRequirements = '핵심 요구사항은 필수입니다.';
    }

    if (!formData.documentTone || formData.documentTone.trim() === '') {
      errors.documentTone = '문서 톤은 필수입니다.';
    } else {
      // 유효한 문서 톤 값 확인
      const validTones = ['formal', 'technical', 'concise'];
      if (!validTones.includes(formData.documentTone)) {
        errors.documentTone = '유효하지 않은 문서 톤입니다.';
      }
    }

    if (!formData.deliverableType || formData.deliverableType.trim() === '') {
      errors.deliverableType = '산출물 타입은 필수입니다.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * 생성된 산출물의 유효성을 검증합니다.
   * @param {string} draft - 검증할 산출물 콘텐츠 (Markdown)
   * @param {Object} template - 템플릿 객체
   * @returns {Object} 검증 결과 {isValid: boolean, warnings: Array}
   */
  validateDraft(draft, template) {
    const warnings = [];

    // Markdown 형식 유효성 검증
    const markdownValidation = this.validateMarkdown(draft);
    if (!markdownValidation.isValid) {
      warnings.push(...markdownValidation.warnings);
    }

    // 필수 섹션 확인
    const sectionValidation = this.checkRequiredSections(draft, template);
    if (!sectionValidation.isValid) {
      warnings.push(...sectionValidation.warnings);
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * 산출물에 필수 섹션이 모두 포함되어 있는지 확인합니다.
   * @param {string} draft - 산출물 콘텐츠 (Markdown)
   * @param {Object} template - 템플릿 객체
   * @returns {Object} 검증 결과 {isValid: boolean, warnings: Array}
   */
  checkRequiredSections(draft, template) {
    const warnings = [];
    const draftLower = draft.toLowerCase();

    // 공통 섹션 확인
    const allSections = [
      ...template.commonSections,
      ...template.specificSections
    ];

    const requiredSections = allSections.filter(section => section.required);

    for (const section of requiredSections) {
      const sectionTitle = section.title.toLowerCase();
      
      // Markdown 헤더 형식으로 섹션 존재 여부 확인
      // # 섹션, ## 섹션, ### 섹션 등의 형태를 모두 확인
      const headerPatterns = [
        new RegExp(`^#+ ${this.escapeRegex(sectionTitle)}`, 'mi'),
        new RegExp(`^#+ \\*\\*${this.escapeRegex(sectionTitle)}\\*\\*`, 'mi')
      ];

      const sectionExists = headerPatterns.some(pattern => pattern.test(draft));

      if (!sectionExists) {
        // "Assumptions/Risks" 섹션에 대한 특별 경고
        if (sectionTitle.includes('assumption') || sectionTitle.includes('risk')) {
          warnings.push(`⚠️ 중요: "Assumptions/Risks" 섹션이 누락되었습니다. 이 섹션은 프로젝트의 가정사항과 위험요소를 명확히 하는 데 필수적입니다.`);
        } else {
          warnings.push(`필수 섹션이 누락되었습니다: ${section.title}`);
        }
      }
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Markdown 형식의 유효성을 검증합니다.
   * @param {string} content - 검증할 Markdown 콘텐츠
   * @returns {Object} 검증 결과 {isValid: boolean, warnings: Array}
   */
  validateMarkdown(content) {
    const warnings = [];

    // 기본 검증: 콘텐츠가 비어있지 않은지 확인
    if (!content || content.trim() === '') {
      warnings.push('산출물 콘텐츠가 비어있습니다.');
      return { isValid: false, warnings };
    }

    // Markdown 기본 구조 확인
    // 최소한 하나의 헤더가 있어야 함
    const hasHeader = /^#+\s+.+/m.test(content);
    if (!hasHeader) {
      warnings.push('Markdown 문서에 헤더가 없습니다.');
    }

    // 닫히지 않은 코드 블록 확인
    const codeBlockMatches = content.match(/```/g);
    if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
      warnings.push('닫히지 않은 코드 블록이 있습니다.');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * 정규식에서 특수 문자를 이스케이프합니다.
   * @param {string} string - 이스케이프할 문자열
   * @returns {string} 이스케이프된 문자열
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default Validator;
