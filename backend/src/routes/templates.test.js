import { test, describe } from 'node:test';
import assert from 'node:assert';
import TemplateManager from '../services/TemplateManager.js';

describe('GET /api/templates 엔드포인트 로직 테스트', () => {
  let templateManager;

  test('템플릿 목록을 조회할 수 있어야 함', async () => {
    // Given
    templateManager = new TemplateManager();

    // When
    const templates = await templateManager.listTemplates();

    // Then
    assert.ok(Array.isArray(templates), '템플릿 목록은 배열이어야 함');
    assert.ok(templates.length > 0, '최소 하나 이상의 템플릿이 있어야 함');
  });

  test('각 템플릿은 type과 name 필드를 가져야 함', async () => {
    // Given
    templateManager = new TemplateManager();

    // When
    const templates = await templateManager.listTemplates();

    // Then
    templates.forEach(template => {
      assert.ok(template.type, '템플릿은 type 필드를 가져야 함');
      assert.ok(template.name, '템플릿은 name 필드를 가져야 함');
      assert.strictEqual(typeof template.type, 'string', 'type은 문자열이어야 함');
      assert.strictEqual(typeof template.name, 'string', 'name은 문자열이어야 함');
    });
  });

  test('템플릿 목록에 MVP 타입들이 포함되어야 함', async () => {
    // Given
    templateManager = new TemplateManager();
    const expectedTypes = ['type1', 'type2', 'type3'];

    // When
    const templates = await templateManager.listTemplates();
    const templateTypes = templates.map(t => t.type);

    // Then
    expectedTypes.forEach(expectedType => {
      assert.ok(
        templateTypes.includes(expectedType),
        `템플릿 목록에 ${expectedType}이 포함되어야 함`
      );
    });
  });

  test('응답 형식이 올바른 구조를 가져야 함', async () => {
    // Given
    templateManager = new TemplateManager();

    // When
    const templates = await templateManager.listTemplates();
    const response = { templates };

    // Then
    assert.ok(response.templates, '응답에 templates 필드가 있어야 함');
    assert.ok(Array.isArray(response.templates), 'templates는 배열이어야 함');
  });

  test('템플릿 목록이 비어있지 않아야 함', async () => {
    // Given
    templateManager = new TemplateManager();

    // When
    const templates = await templateManager.listTemplates();

    // Then
    assert.ok(templates.length >= 3, '최소 3개의 MVP 템플릿이 있어야 함');
  });
});
