import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import TemplateManager from './TemplateManager.js';

describe('TemplateManager', () => {
  let templateManager;

  beforeEach(() => {
    templateManager = new TemplateManager();
  });

  describe('loadTemplate', () => {
    test('유효한 템플릿 타입으로 템플릿을 로드할 수 있어야 함', async () => {
      const template = await templateManager.loadTemplate('type1');
      
      assert.ok(template);
      assert.strictEqual(template.type, 'type1');
      assert.strictEqual(template.name, '아키텍처 설계서');
      assert.ok(Array.isArray(template.commonSections));
      assert.ok(Array.isArray(template.specificSections));
      assert.ok(Array.isArray(template.rules));
    });

    test('존재하지 않는 템플릿 타입은 오류를 발생시켜야 함', async () => {
      await assert.rejects(
        async () => await templateManager.loadTemplate('invalid-type'),
        /템플릿을 찾을 수 없습니다/
      );
    });

    test('모든 MVP 템플릿 타입(type1, type2, type3)을 로드할 수 있어야 함', async () => {
      const type1 = await templateManager.loadTemplate('type1');
      const type2 = await templateManager.loadTemplate('type2');
      const type3 = await templateManager.loadTemplate('type3');

      assert.strictEqual(type1.type, 'type1');
      assert.strictEqual(type2.type, 'type2');
      assert.strictEqual(type3.type, 'type3');
    });
  });

  describe('listTemplates', () => {
    test('사용 가능한 모든 템플릿 목록을 반환해야 함', async () => {
      const templates = await templateManager.listTemplates();
      
      assert.ok(Array.isArray(templates));
      assert.ok(templates.length >= 3);
      
      const types = templates.map(t => t.type);
      assert.ok(types.includes('type1'));
      assert.ok(types.includes('type2'));
      assert.ok(types.includes('type3'));
    });

    test('각 템플릿은 type과 name 속성을 가져야 함', async () => {
      const templates = await templateManager.listTemplates();
      
      templates.forEach(template => {
        assert.ok(template.type);
        assert.ok(template.name);
        assert.strictEqual(typeof template.type, 'string');
        assert.strictEqual(typeof template.name, 'string');
      });
    });
  });

  describe('validateTemplate', () => {
    test('유효한 템플릿은 검증을 통과해야 함', async () => {
      const template = await templateManager.loadTemplate('type1');
      
      assert.doesNotThrow(() => {
        templateManager.validateTemplate(template);
      });
    });

    test('type 필드가 없으면 오류를 발생시켜야 함', () => {
      const invalidTemplate = {
        name: '테스트',
        commonSections: [],
        specificSections: [],
        rules: []
      };

      assert.throws(
        () => templateManager.validateTemplate(invalidTemplate),
        /템플릿에 type 필드가 없습니다/
      );
    });

    test('name 필드가 없으면 오류를 발생시켜야 함', () => {
      const invalidTemplate = {
        type: 'test',
        commonSections: [],
        specificSections: [],
        rules: []
      };

      assert.throws(
        () => templateManager.validateTemplate(invalidTemplate),
        /템플릿에 name 필드가 없습니다/
      );
    });

    test('commonSections가 배열이 아니면 오류를 발생시켜야 함', () => {
      const invalidTemplate = {
        type: 'test',
        name: '테스트',
        commonSections: 'not-an-array',
        specificSections: [],
        rules: []
      };

      assert.throws(
        () => templateManager.validateTemplate(invalidTemplate),
        /템플릿에 commonSections 배열이 없습니다/
      );
    });

    test('섹션에 필수 필드가 없으면 오류를 발생시켜야 함', () => {
      const invalidTemplate = {
        type: 'test',
        name: '테스트',
        commonSections: [
          { title: '섹션1' } // required와 description 누락
        ],
        specificSections: [],
        rules: []
      };

      assert.throws(() => {
        templateManager.validateTemplate(invalidTemplate);
      });
    });
  });

  describe('템플릿 구조 검증', () => {
    test('모든 템플릿은 Assumptions/Risks 섹션을 포함해야 함', async () => {
      const templates = ['type1', 'type2', 'type3'];
      
      for (const type of templates) {
        const template = await templateManager.loadTemplate(type);
        const allSections = [...template.commonSections, ...template.specificSections];
        const hasAssumptionsRisks = allSections.some(
          section => section.title === 'Assumptions/Risks'
        );
        
        assert.ok(hasAssumptionsRisks, `${type} 템플릿에 Assumptions/Risks 섹션이 없습니다`);
      }
    });

    test('모든 템플릿은 최소 1개 이상의 작성 규칙을 가져야 함', async () => {
      const templates = ['type1', 'type2', 'type3'];
      
      for (const type of templates) {
        const template = await templateManager.loadTemplate(type);
        assert.ok(template.rules.length > 0, `${type} 템플릿에 작성 규칙이 없습니다`);
      }
    });
  });
});
