import express from 'express';
import FileManager from '../services/FileManager.js';

const router = express.Router();

// 서비스 인스턴스 생성
const fileManager = new FileManager();

/**
 * GET /api/download/:filename
 * 저장된 산출물을 다운로드합니다.
 */
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // 1. 파일명 검증 (보안: 경로 탐색 공격 방지)
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 파일명입니다.'
      });
    }

    // 2. File Manager 호출하여 파일 로드
    const content = await fileManager.loadDraft(filename);

    // 3. 적절한 헤더 설정 및 파일 내용 반환
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    
    // 파일을 찾을 수 없는 경우
    if (error.message.includes('찾을 수 없습니다')) {
      return res.status(404).json({
        success: false,
        error: '요청한 파일을 찾을 수 없습니다.'
      });
    }

    // 기타 서버 오류
    res.status(500).json({
      success: false,
      error: '파일 다운로드 중 오류가 발생했습니다.'
    });
  }
});

export default router;
