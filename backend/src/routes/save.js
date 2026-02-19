import express from 'express';
import FileManager from '../services/FileManager.js';

const router = express.Router();

// 서비스 인스턴스 생성
const fileManager = new FileManager();

/**
 * POST /api/save
 * 생성된 산출물을 서버에 저장합니다.
 */
router.post('/save', async (req, res) => {
  try {
    const { content, deliverableType, metadata } = req.body;

    // 1. 필수 필드 검증
    if (!content || !deliverableType) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다.',
        validationErrors: {
          content: !content ? '콘텐츠는 필수입니다.' : undefined,
          deliverableType: !deliverableType ? '산출물 타입은 필수입니다.' : undefined
        }
      });
    }

    // 2. File Manager 호출하여 파일 저장
    const result = await fileManager.saveDraft(content, {
      deliverableType,
      ...metadata
    });

    // 3. 저장된 파일 정보 반환
    res.json({
      success: true,
      filename: result.filename,
      path: result.path
    });

  } catch (error) {
    console.error('산출물 저장 오류:', error);
    res.status(500).json({
      success: false,
      error: '파일 저장 중 오류가 발생했습니다.'
    });
  }
});

export default router;
