import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import DraftGenerator from './DraftGenerator.js';

describe('DraftGenerator', () => {
  let generator;
  let sampleUserInput;
  let sampleTemplate;

  beforeEach(() => {
    generator = new DraftGenerator();
    
    sampleUserInput = {
      projectSummary: '전자상거래 플랫폼 구축',
      coreRequirements: '고가용성, 확장성, 보안',
      documentTone: 'technical'
    };

    sampleTemplate = {
      type: 'type1',
      name: '아키텍처 설계서',
      commonSections: [
        {
          title: '개요',
          required: true,
          description: '프로젝트 개요'
        },
        {
          title: 'Assumptions/Risks',
          required: true,
          description: '가정사항 및 위험요소'
        }
      ],
      specificSections: [
        {
          title: '아키텍처 설계',
          required: true,
          description: '시스템 아키텍처'
        }
      ],
      rules: [
        'AWS Well-Architected Framework 준수',
        'Markdown 형식 사용'
      ]
    };
  });

  describe('generateDraft', () => {
    it('LLM 사용 불가능 시 데모 모드로 콘텐츠를 생성해야 함 (Requirements 2.4)', async () => {
      const draft = await generator.generateDraft(sampleUserInput, sampleTemplate, false);
      
      assert.ok(draft);
      assert.strictEqual(typeof draft, 'string');
      assert.ok(draft.length > 0);
      assert.ok(draft.includes('# 아키텍처 설계서'));
      assert.ok(draft.includes('데모 모드로 생성된 샘플'));
    });

    it('생성된 산출물은 Markdown 형식이어야 함 (Requirements 2.5)', async () => {
      const draft = await generator.generateDraft(sampleUserInput, sampleTemplate, false);
      
      // Markdown 헤더 확인
      assert.ok(/^#\s+/m.test(draft));
      assert.ok(/^##\s+/m.test(draft));
    });

    it('모든 섹션을 포함해야 함', async () => {
      const draft = await generator.generateDraft(sampleUserInput, sampleTemplate, false);
      
      // 공통 섹션 확인
      assert.ok(draft.includes('## 개요'));
      assert.ok(draft.includes('## Assumptions/Risks'));
      
      // 특정 섹션 확인
      assert.ok(draft.includes('## 아키텍처 설계'));
    });

    it('사용자 입력 정보를 포함해야 함', async () => {
      const draft = await generator.generateDraft(sampleUserInput, sampleTemplate, false);
      
      assert.ok(draft.includes(sampleUserInput.projectSummary));
      assert.ok(draft.includes(sampleUserInput.coreRequirements));
    });
  });

  describe('createPrompt', () => {
    it('사용자 입력의 모든 필드를 포함해야 함 (Requirements 2.2)', () => {
      const prompt = generator.createPrompt(sampleUserInput, sampleTemplate);
      
      assert.ok(prompt.includes(sampleUserInput.projectSummary));
      assert.ok(prompt.includes(sampleUserInput.coreRequirements));
      assert.ok(prompt.includes('기술적이고 상세한'));
    });

    it('템플릿의 모든 섹션 정보를 포함해야 함 (Requirements 2.2)', () => {
      const prompt = generator.createPrompt(sampleUserInput, sampleTemplate);
      
      // 공통 섹션
      assert.ok(prompt.includes('개요'));
      assert.ok(prompt.includes('Assumptions/Risks'));
      
      // 특정 섹션
      assert.ok(prompt.includes('아키텍처 설계'));
    });

    it('템플릿의 작성 규칙을 포함해야 함', () => {
      const prompt = generator.createPrompt(sampleUserInput, sampleTemplate);
      
      sampleTemplate.rules.forEach(rule => {
        assert.ok(prompt.includes(rule));
      });
    });

    it('문서 톤에 따라 적절한 설명을 포함해야 함', () => {
      const tones = {
        formal: '공식적이고 격식있는',
        technical: '기술적이고 상세한',
        concise: '간결하고 핵심적인'
      };

      Object.entries(tones).forEach(([tone, description]) => {
        const input = { ...sampleUserInput, documentTone: tone };
        const prompt = generator.createPrompt(input, sampleTemplate);
        assert.ok(prompt.includes(description));
      });
    });

    it('필수 섹션을 명시해야 함', () => {
      const prompt = generator.createPrompt(sampleUserInput, sampleTemplate);
      
      assert.ok(prompt.includes('개요 (필수)'));
      assert.ok(prompt.includes('Assumptions/Risks (필수)'));
    });
  });

  describe('callLLM', () => {
    it('LLM 서비스가 구성되지 않은 경우 null을 반환해야 함', async () => {
      const result = await generator.callLLM('test prompt');
      assert.strictEqual(result, null);
    });
  });

  describe('generateDemoContent', () => {
    it('유효한 Markdown 형식의 콘텐츠를 생성해야 함', () => {
      const content = generator.generateDemoContent(sampleUserInput, sampleTemplate);
      
      assert.ok(content);
      assert.ok(/^#\s+/m.test(content));
      assert.ok(/^##\s+/m.test(content));
    });

    it('템플릿의 모든 섹션을 포함해야 함', () => {
      const content = generator.generateDemoContent(sampleUserInput, sampleTemplate);
      
      const allSections = [
        ...sampleTemplate.commonSections,
        ...sampleTemplate.specificSections
      ];

      allSections.forEach(section => {
        assert.ok(content.includes(`## ${section.title}`));
      });
    });

    it('사용자 입력 정보를 포함해야 함', () => {
      const content = generator.generateDemoContent(sampleUserInput, sampleTemplate);
      
      assert.ok(content.includes(sampleUserInput.projectSummary));
      assert.ok(content.includes(sampleUserInput.coreRequirements));
      assert.ok(content.includes(sampleUserInput.documentTone));
    });

    it('데모 모드 표시를 포함해야 함', () => {
      const content = generator.generateDemoContent(sampleUserInput, sampleTemplate);
      
      assert.ok(content.includes('데모 모드로 생성된 샘플'));
    });

    it('생성 일시를 포함해야 함', () => {
      const content = generator.generateDemoContent(sampleUserInput, sampleTemplate);
      
      assert.ok(content.includes('생성 일시'));
    });
  });

  describe('generateSectionContent', () => {
    it('개요 섹션에 프로젝트 요약과 핵심 요구사항을 포함해야 함', () => {
      const section = { title: '개요', required: true, description: '프로젝트 개요' };
      const content = generator.generateSectionContent(section, sampleUserInput, sampleTemplate);
      
      assert.ok(content.includes(sampleUserInput.projectSummary));
      assert.ok(content.includes(sampleUserInput.coreRequirements));
    });

    it('Assumptions/Risks 섹션에 가정사항과 위험요소를 포함해야 함', () => {
      const section = { title: 'Assumptions/Risks', required: true, description: '가정사항 및 위험요소' };
      const content = generator.generateSectionContent(section, sampleUserInput, sampleTemplate);
      
      assert.ok(content.includes('가정사항'));
      assert.ok(content.includes('위험 요소'));
      assert.ok(content.includes('완화 방안'));
    });

    it('아키텍처 섹션에 시스템 구조를 포함해야 함', () => {
      const section = { title: '아키텍처 설계', required: true, description: '시스템 아키텍처' };
      const content = generator.generateSectionContent(section, sampleUserInput, sampleTemplate);
      
      assert.ok(content.includes('시스템 구조'));
      assert.ok(content.includes('주요 컴포넌트'));
      assert.ok(content.includes('데이터 흐름'));
    });

    it('기본 섹션에 설명과 고려사항을 포함해야 함', () => {
      const section = { title: '기타 섹션', required: false, description: '기타 내용' };
      const content = generator.generateSectionContent(section, sampleUserInput, sampleTemplate);
      
      assert.ok(content.includes(section.description));
      assert.ok(content.includes('주요 고려사항'));
    });
  });

  describe('엣지 케이스', () => {
    it('빈 템플릿 섹션도 처리할 수 있어야 함', async () => {
      const emptyTemplate = {
        ...sampleTemplate,
        commonSections: [],
        specificSections: []
      };

      const draft = await generator.generateDraft(sampleUserInput, emptyTemplate, false);
      assert.ok(draft);
      assert.ok(draft.includes('# 아키텍처 설계서'));
    });

    it('긴 사용자 입력도 처리할 수 있어야 함', async () => {
      const longInput = {
        projectSummary: 'A'.repeat(1000),
        coreRequirements: 'B'.repeat(1000),
        documentTone: 'formal'
      };

      const draft = await generator.generateDraft(longInput, sampleTemplate, false);
      assert.ok(draft);
      assert.ok(draft.length > 0);
    });

    it('특수 문자가 포함된 입력도 처리할 수 있어야 함', async () => {
      const specialInput = {
        projectSummary: '프로젝트 <test> & "quotes" \'single\'',
        coreRequirements: '요구사항 `code` **bold** *italic*',
        documentTone: 'technical'
      };

      const draft = await generator.generateDraft(specialInput, sampleTemplate, false);
      assert.ok(draft);
      assert.ok(draft.includes(specialInput.projectSummary));
    });
  });
});
