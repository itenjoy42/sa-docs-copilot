import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Validator from './Validator.js';

describe('Validator', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
  });

  describe('validateInput', () => {
    it('유효한 입력 데이터를 수락해야 함', () => {
      const formData = {
        projectSummary: '테스트 프로젝트',
        coreRequirements: '핵심 요구사항',
        documentTone: 'formal',
        deliverableType: 'type1'
      };

      const result = validator.validateInput(formData);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(Object.keys(result.errors).length, 0);
    });

    it('projectSummary가 누락된 경우 오류를 반환해야 함', () => {
      const formData = {
        projectSummary: '',
        coreRequirements: '핵심 요구사항',
        documentTone: 'formal',
        deliverableType: 'type1'
      };

      const result = validator.validateInput(formData);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.errors.projectSummary, '프로젝트 요약은 필수입니다.');
    });

    it('coreRequirements가 누락된 경우 오류를 반환해야 함', () => {
      const formData = {
        projectSummary: '테스트 프로젝트',
        coreRequirements: '',
        documentTone: 'formal',
        deliverableType: 'type1'
      };

      const result = validator.validateInput(formData);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.errors.coreRequirements, '핵심 요구사항은 필수입니다.');
    });

    it('documentTone이 누락된 경우 오류를 반환해야 함', () => {
      const formData = {
        projectSummary: '테스트 프로젝트',
        coreRequirements: '핵심 요구사항',
        documentTone: '',
        deliverableType: 'type1'
      };

      const result = validator.validateInput(formData);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.errors.documentTone, '문서 톤은 필수입니다.');
    });

    it('유효하지 않은 documentTone인 경우 오류를 반환해야 함', () => {
      const formData = {
        projectSummary: '테스트 프로젝트',
        coreRequirements: '핵심 요구사항',
        documentTone: 'invalid',
        deliverableType: 'type1'
      };

      const result = validator.validateInput(formData);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.errors.documentTone, '유효하지 않은 문서 톤입니다.');
    });

    it('deliverableType이 누락된 경우 오류를 반환해야 함', () => {
      const formData = {
        projectSummary: '테스트 프로젝트',
        coreRequirements: '핵심 요구사항',
        documentTone: 'formal',
        deliverableType: ''
      };

      const result = validator.validateInput(formData);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.errors.deliverableType, '산출물 타입은 필수입니다.');
    });

    it('여러 필드가 누락된 경우 모든 오류를 반환해야 함', () => {
      const formData = {
        projectSummary: '',
        coreRequirements: '',
        documentTone: '',
        deliverableType: ''
      };

      const result = validator.validateInput(formData);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(Object.keys(result.errors).length, 4);
    });

    it('공백만 있는 필드는 누락으로 처리해야 함', () => {
      const formData = {
        projectSummary: '   ',
        coreRequirements: '핵심 요구사항',
        documentTone: 'formal',
        deliverableType: 'type1'
      };

      const result = validator.validateInput(formData);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.errors.projectSummary, '프로젝트 요약은 필수입니다.');
    });
  });

  describe('validateMarkdown', () => {
    it('유효한 Markdown 콘텐츠를 수락해야 함', () => {
      const content = '# 제목\n\n본문 내용입니다.';

      const result = validator.validateMarkdown(content);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.warnings.length, 0);
    });

    it('빈 콘텐츠는 경고를 반환해야 함', () => {
      const content = '';

      const result = validator.validateMarkdown(content);

      assert.strictEqual(result.isValid, false);
      assert.ok(result.warnings.includes('산출물 콘텐츠가 비어있습니다.'));
    });

    it('헤더가 없는 콘텐츠는 경고를 반환해야 함', () => {
      const content = '본문만 있는 콘텐츠입니다.';

      const result = validator.validateMarkdown(content);

      assert.strictEqual(result.isValid, false);
      assert.ok(result.warnings.includes('Markdown 문서에 헤더가 없습니다.'));
    });

    it('닫히지 않은 코드 블록이 있으면 경고를 반환해야 함', () => {
      const content = '# 제목\n\n```javascript\nconst x = 1;\n\n본문';

      const result = validator.validateMarkdown(content);

      assert.strictEqual(result.isValid, false);
      assert.ok(result.warnings.includes('닫히지 않은 코드 블록이 있습니다.'));
    });

    it('올바르게 닫힌 코드 블록은 유효해야 함', () => {
      const content = '# 제목\n\n```javascript\nconst x = 1;\n```\n\n본문';

      const result = validator.validateMarkdown(content);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.warnings.length, 0);
    });
  });

  describe('checkRequiredSections', () => {
    const template = {
      commonSections: [
        { title: '개요', required: true, description: '프로젝트 개요' },
        { title: '선택 섹션', required: false, description: '선택적 섹션' }
      ],
      specificSections: [
        { title: '기술 스택', required: true, description: '사용 기술' },
        { title: 'Assumptions/Risks', required: true, description: '가정사항 및 위험요소' }
      ]
    };

    it('모든 필수 섹션이 있으면 유효해야 함', () => {
      const draft = `
# 개요

프로젝트 개요입니다.

## 기술 스택

사용 기술입니다.

### Assumptions/Risks

가정사항과 위험요소입니다.
      `;

      const result = validator.checkRequiredSections(draft, template);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.warnings.length, 0);
    });

    it('필수 섹션이 누락되면 경고를 반환해야 함', () => {
      const draft = `
# 개요

프로젝트 개요입니다.
      `;

      const result = validator.checkRequiredSections(draft, template);

      assert.strictEqual(result.isValid, false);
      assert.ok(result.warnings.length > 0);
      assert.ok(result.warnings.some(w => w.includes('기술 스택')));
    });

    it('Assumptions/Risks 섹션이 누락되면 특별 경고를 반환해야 함', () => {
      const draft = `
# 개요

프로젝트 개요입니다.

## 기술 스택

사용 기술입니다.
      `;

      const result = validator.checkRequiredSections(draft, template);

      assert.strictEqual(result.isValid, false);
      assert.ok(result.warnings.some(w => w.includes('⚠️ 중요') && w.includes('Assumptions/Risks')));
    });

    it('선택 섹션이 없어도 유효해야 함', () => {
      const draft = `
# 개요

프로젝트 개요입니다.

## 기술 스택

사용 기술입니다.

### Assumptions/Risks

가정사항과 위험요소입니다.
      `;

      const result = validator.checkRequiredSections(draft, template);

      assert.strictEqual(result.isValid, true);
    });

    it('대소문자 구분 없이 섹션을 찾아야 함', () => {
      const draft = `
# 개요

프로젝트 개요입니다.

## 기술 스택

사용 기술입니다.

### assumptions/risks

가정사항과 위험요소입니다.
      `;

      const result = validator.checkRequiredSections(draft, template);

      assert.strictEqual(result.isValid, true);
    });
  });

  describe('validateDraft', () => {
    const template = {
      commonSections: [
        { title: '개요', required: true, description: '프로젝트 개요' }
      ],
      specificSections: [
        { title: '기술 스택', required: true, description: '사용 기술' }
      ]
    };

    it('유효한 산출물을 수락해야 함', () => {
      const draft = `
# 개요

프로젝트 개요입니다.

## 기술 스택

사용 기술입니다.
      `;

      const result = validator.validateDraft(draft, template);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.warnings.length, 0);
    });

    it('Markdown 형식과 섹션 검증을 모두 수행해야 함', () => {
      const draft = '본문만 있고 헤더가 없습니다.';

      const result = validator.validateDraft(draft, template);

      assert.strictEqual(result.isValid, false);
      assert.ok(result.warnings.length > 0);
    });
  });
});
