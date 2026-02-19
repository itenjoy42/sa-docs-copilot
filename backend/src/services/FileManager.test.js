import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FileManager from './FileManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('FileManager', () => {
  let fileManager;
  const testOutputsDir = path.join(__dirname, '../outputs');

  beforeEach(() => {
    fileManager = new FileManager();
  });

  afterEach(async () => {
    // 테스트 중 생성된 파일 정리
    try {
      const files = await fs.readdir(testOutputsDir);
      for (const file of files) {
        if (file.startsWith('test_') && file.endsWith('.md')) {
          await fs.unlink(path.join(testOutputsDir, file));
        }
      }
    } catch (error) {
      // 정리 실패는 무시
    }
  });

  describe('generateUniqueFilename', () => {
    it('산출물 타입과 타임스탬프를 포함한 파일명을 생성해야 함', () => {
      const filename = fileManager.generateUniqueFilename('type1');
      
      // 파일명 형식 검증: type1_YYYYMMDD_HHMMSS.md
      assert.match(filename, /^type1_\d{8}_\d{6}\.md$/);
    });

    it('다른 산출물 타입에 대해 올바른 파일명을 생성해야 함', () => {
      const filename = fileManager.generateUniqueFilename('type2');
      
      assert.match(filename, /^type2_\d{8}_\d{6}\.md$/);
    });

    it('연속으로 호출 시 고유한 파일명을 생성해야 함', async () => {
      const filename1 = fileManager.generateUniqueFilename('type1');
      
      // 1초 대기하여 타임스탬프가 달라지도록 함
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filename2 = fileManager.generateUniqueFilename('type1');
      
      assert.notStrictEqual(filename1, filename2);
    });
  });

  describe('saveDraft', () => {
    it('산출물을 파일로 저장하고 파일 정보를 반환해야 함', async () => {
      const content = '# 테스트 산출물\n\n테스트 콘텐츠입니다.';
      const metadata = {
        deliverableType: 'test_type1',
        projectSummary: '테스트 프로젝트',
        coreRequirements: '테스트 요구사항',
        documentTone: 'formal',
        usedLLM: false
      };

      const result = await fileManager.saveDraft(content, metadata);

      assert.ok(result.filename);
      assert.ok(result.path);
      assert.match(result.filename, /^test_type1_\d{8}_\d{6}\.md$/);
      assert.strictEqual(result.path, `/outputs/${result.filename}`);

      // 파일이 실제로 생성되었는지 확인
      const filePath = path.join(testOutputsDir, result.filename);
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      assert.strictEqual(fileExists, true);
    });

    it('저장된 파일에 메타데이터가 포함되어야 함', async () => {
      const content = '# 테스트 산출물';
      const metadata = {
        deliverableType: 'test_type2',
        projectSummary: '테스트 프로젝트',
        coreRequirements: '테스트 요구사항',
        documentTone: 'technical',
        usedLLM: true
      };

      const result = await fileManager.saveDraft(content, metadata);
      const filePath = path.join(testOutputsDir, result.filename);
      const savedContent = await fs.readFile(filePath, 'utf-8');

      assert.ok(savedContent.includes('---'));
      assert.ok(savedContent.includes('생성 일시:'));
      assert.ok(savedContent.includes('산출물 타입: test_type2'));
      assert.ok(savedContent.includes('문서 톤: technical'));
      assert.ok(savedContent.includes('LLM 사용: 예'));
      assert.ok(savedContent.includes(content));
    });
  });

  describe('loadDraft', () => {
    it('저장된 파일을 로드해야 함', async () => {
      const content = '# 테스트 산출물\n\n로드 테스트';
      const metadata = {
        deliverableType: 'test_type3',
        projectSummary: '테스트',
        coreRequirements: '테스트',
        documentTone: 'concise',
        usedLLM: false
      };

      const { filename } = await fileManager.saveDraft(content, metadata);
      const loadedContent = await fileManager.loadDraft(filename);

      assert.ok(loadedContent.includes(content));
    });

    it('존재하지 않는 파일 로드 시 오류를 발생시켜야 함', async () => {
      await assert.rejects(
        async () => await fileManager.loadDraft('nonexistent_file.md'),
        /파일을 찾을 수 없습니다/
      );
    });
  });

  describe('파일 저장 정확성 (Property 6)', () => {
    it('저장 후 로드한 콘텐츠가 원본과 동일해야 함', async () => {
      const originalContent = '# 원본 산출물\n\n## 섹션 1\n\n테스트 내용입니다.\n\n## 섹션 2\n\n더 많은 내용.';
      const metadata = {
        deliverableType: 'test_type4',
        projectSummary: '프로젝트 요약',
        coreRequirements: '핵심 요구사항',
        documentTone: 'formal',
        usedLLM: false
      };

      const { filename } = await fileManager.saveDraft(originalContent, metadata);
      const loadedContent = await fileManager.loadDraft(filename);

      // 로드된 콘텐츠에 원본 콘텐츠가 포함되어 있어야 함
      assert.ok(loadedContent.includes(originalContent));
    });
  });

  describe('listDrafts', () => {
    it('저장된 산출물 파일 목록을 반환해야 함', async () => {
      const content = '# 테스트';
      const metadata = {
        deliverableType: 'test_type5',
        projectSummary: '테스트',
        coreRequirements: '테스트',
        documentTone: 'formal',
        usedLLM: false
      };

      const { filename } = await fileManager.saveDraft(content, metadata);
      const drafts = await fileManager.listDrafts();

      assert.ok(Array.isArray(drafts));
      
      // 방금 저장한 파일이 목록에 있어야 함
      const testDraft = drafts.find(d => d.filename === filename);
      assert.ok(testDraft, `파일 ${filename}이 목록에 없습니다. 목록: ${JSON.stringify(drafts.map(d => d.filename))}`);
      assert.ok(testDraft.filename);
      assert.ok(testDraft.createdAt);
      assert.ok(testDraft.deliverableType);
    });

    it('파일 목록이 생성 시간 기준 내림차순으로 정렬되어야 함', async () => {
      const content = '# 테스트';
      const metadata1 = {
        deliverableType: 'test_sort1',
        projectSummary: '테스트',
        coreRequirements: '테스트',
        documentTone: 'formal',
        usedLLM: false
      };

      await fileManager.saveDraft(content, metadata1);
      
      // 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const metadata2 = {
        deliverableType: 'test_sort2',
        projectSummary: '테스트',
        coreRequirements: '테스트',
        documentTone: 'formal',
        usedLLM: false
      };

      await fileManager.saveDraft(content, metadata2);
      
      const drafts = await fileManager.listDrafts();
      const testDrafts = drafts.filter(d => d.deliverableType.startsWith('test_sort'));

      if (testDrafts.length >= 2) {
        // 최신 파일이 먼저 와야 함
        assert.ok(testDrafts[0].createdAt.getTime() >= testDrafts[1].createdAt.getTime());
      }
    });
  });

  describe('createFileContent', () => {
    it('메타데이터와 콘텐츠를 결합해야 함', () => {
      const content = '# 테스트 산출물';
      const metadata = {
        deliverableType: 'type1',
        documentTone: 'formal',
        usedLLM: true
      };

      const fullContent = fileManager.createFileContent(content, metadata);

      assert.ok(fullContent.includes('---'));
      assert.ok(fullContent.includes('생성 일시:'));
      assert.ok(fullContent.includes('산출물 타입: type1'));
      assert.ok(fullContent.includes('문서 톤: formal'));
      assert.ok(fullContent.includes('LLM 사용: 예'));
      assert.ok(fullContent.includes(content));
    });
  });
});
