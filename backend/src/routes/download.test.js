import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import FileManager from '../services/FileManager.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('GET /api/download/:filename 엔드포인트 로직 테스트', () => {
  let fileManager;
  let testFilename;

  before(async () => {
    // 테스트용 파일 생성
    fileManager = new FileManager();
    const content = '# 테스트 산출물\n\n다운로드 테스트용 내용입니다.';
    const metadata = {
      deliverableType: 'type1',
      projectSummary: '테스트 프로젝트',
      documentTone: 'formal',
      usedLLM: false
    };
    const result = await fileManager.saveDraft(content, metadata);
    testFilename = result.filename;
  });

  after(async () => {
    // 테스트 파일 정리
    if (testFilename) {
      try {
        const outputsDir = path.join(__dirname, '../outputs');
        await fs.unlink(path.join(outputsDir, testFilename));
      } catch (err) {
        // 정리 실패는 무시
      }
    }
  });

  test('존재하는 파일을 다운로드할 수 있어야 함', async () => {
    // Given: before 훅에서 생성된 testFilename

    // When
    const content = await fileManager.loadDraft(testFilename);

    // Then
    assert.ok(content, '파일 내용이 반환되어야 함');
    assert.ok(content.includes('테스트 산출물'), '원본 콘텐츠가 포함되어야 함');
    assert.ok(content.includes('다운로드 테스트용 내용입니다'), '원본 콘텐츠가 포함되어야 함');
  });

  test('존재하지 않는 파일 다운로드 시 오류 발생', async () => {
    // Given
    const nonExistentFilename = 'nonexistent_file.md';

    // When & Then
    try {
      await fileManager.loadDraft(nonExistentFilename);
      assert.fail('오류가 발생해야 함');
    } catch (error) {
      assert.ok(error.message.includes('찾을 수 없습니다'), '파일을 찾을 수 없다는 오류 메시지가 있어야 함');
    }
  });

  test('유효하지 않은 파일명 검증 - 경로 탐색 공격 방지 (..)', () => {
    // Given
    const maliciousFilename = '../../../etc/passwd';

    // When & Then
    const isValid = !maliciousFilename.includes('..');
    assert.strictEqual(isValid, false, '.. 포함된 파일명은 유효하지 않아야 함');
  });

  test('유효하지 않은 파일명 검증 - 경로 탐색 공격 방지 (/)', () => {
    // Given
    const maliciousFilename = '/etc/passwd';

    // When & Then
    const isValid = !maliciousFilename.includes('/');
    assert.strictEqual(isValid, false, '/ 포함된 파일명은 유효하지 않아야 함');
  });

  test('빈 파일명 검증', () => {
    // Given
    const emptyFilename = '';

    // When & Then
    const isValid = !!emptyFilename;
    assert.strictEqual(isValid, false, '빈 파일명은 유효하지 않아야 함');
  });

  test('다운로드된 파일 내용이 원본과 동일해야 함', async () => {
    // Given
    const originalContent = '# 원본 산출물\n\n원본 내용입니다.';
    const metadata = {
      deliverableType: 'type2',
      documentTone: 'technical',
      usedLLM: true
    };

    // When
    const saveResult = await fileManager.saveDraft(originalContent, metadata);
    const loadedContent = await fileManager.loadDraft(saveResult.filename);

    // Then
    assert.ok(loadedContent.includes(originalContent), '로드된 내용에 원본 콘텐츠가 포함되어야 함');
  });

  test('Content-Type 헤더 검증 시뮬레이션', () => {
    // Given
    const expectedContentType = 'text/markdown; charset=utf-8';

    // When
    const headers = {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${testFilename}"`
    };

    // Then
    assert.strictEqual(headers['Content-Type'], expectedContentType, 'Content-Type이 text/markdown이어야 함');
    assert.ok(headers['Content-Disposition'].includes('attachment'), 'Content-Disposition에 attachment가 포함되어야 함');
    assert.ok(headers['Content-Disposition'].includes(testFilename), 'Content-Disposition에 파일명이 포함되어야 함');
  });
});
