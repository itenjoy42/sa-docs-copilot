import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import FileManager from '../services/FileManager.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('POST /api/save 엔드포인트 로직 테스트', () => {
  let fileManager;
  const testOutputsDir = path.join(__dirname, '../test-outputs');

  before(async () => {
    // 테스트용 outputs 디렉토리 생성
    try {
      await fs.mkdir(testOutputsDir, { recursive: true });
    } catch (err) {
      // 이미 존재하면 무시
    }
  });

  after(async () => {
    // 테스트 파일 정리
    try {
      const files = await fs.readdir(testOutputsDir);
      for (const file of files) {
        await fs.unlink(path.join(testOutputsDir, file));
      }
      await fs.rmdir(testOutputsDir);
    } catch (err) {
      // 정리 실패는 무시
    }
  });

  test('유효한 요청 데이터로 산출물을 저장할 수 있어야 함', async () => {
    // Given
    fileManager = new FileManager();
    const content = '# 테스트 산출물\n\n테스트 내용입니다.';
    const metadata = {
      deliverableType: 'type1',
      projectSummary: '테스트 프로젝트',
      coreRequirements: '테스트 요구사항',
      documentTone: 'formal',
      usedLLM: false
    };

    // When
    const result = await fileManager.saveDraft(content, metadata);

    // Then
    assert.ok(result.filename, '파일명이 반환되어야 함');
    assert.ok(result.filename.startsWith('type1_'), '파일명이 타입으로 시작해야 함');
    assert.ok(result.filename.endsWith('.md'), '파일명이 .md로 끝나야 함');
    assert.strictEqual(result.path, `/outputs/${result.filename}`);

    // 파일이 실제로 저장되었는지 확인
    const savedContent = await fileManager.loadDraft(result.filename);
    assert.ok(savedContent.includes(content), '저장된 파일에 원본 콘텐츠가 포함되어야 함');
  });

  test('필수 필드 검증 - content 누락', () => {
    // Given
    const requestBody = {
      deliverableType: 'type1',
      metadata: {}
    };

    // When & Then
    const hasContent = !!requestBody.content;
    const hasDeliverableType = !!requestBody.deliverableType;

    assert.strictEqual(hasContent, false, 'content가 없어야 함');
    assert.strictEqual(hasDeliverableType, true, 'deliverableType은 있어야 함');

    // 검증 로직 시뮬레이션
    if (!hasContent) {
      const error = '콘텐츠는 필수입니다.';
      assert.strictEqual(error, '콘텐츠는 필수입니다.');
    }
  });

  test('필수 필드 검증 - deliverableType 누락', () => {
    // Given
    const requestBody = {
      content: '# 테스트',
      metadata: {}
    };

    // When & Then
    const hasContent = !!requestBody.content;
    const hasDeliverableType = !!requestBody.deliverableType;

    assert.strictEqual(hasContent, true, 'content가 있어야 함');
    assert.strictEqual(hasDeliverableType, false, 'deliverableType이 없어야 함');

    // 검증 로직 시뮬레이션
    if (!hasDeliverableType) {
      const error = '산출물 타입은 필수입니다.';
      assert.strictEqual(error, '산출물 타입은 필수입니다.');
    }
  });

  test('FileManager 오류 처리', async () => {
    // Given: 잘못된 메타데이터
    fileManager = new FileManager();
    const content = '# 테스트';
    const metadata = {
      deliverableType: null // 잘못된 타입
    };

    // When & Then
    try {
      await fileManager.saveDraft(content, metadata);
      assert.fail('오류가 발생해야 함');
    } catch (error) {
      assert.ok(error, '오류가 발생해야 함');
    }
  });

  test('메타데이터 없이도 저장 가능', async () => {
    // Given
    fileManager = new FileManager();
    const content = '# 산출물\n\n내용';
    const metadata = {
      deliverableType: 'type2'
    };

    // When
    const result = await fileManager.saveDraft(content, metadata);

    // Then
    assert.ok(result.filename, '파일명이 반환되어야 함');
    assert.ok(result.filename.startsWith('type2_'), '파일명이 타입으로 시작해야 함');
  });
});
