import express from 'express';
import TemplateManager from '../services/TemplateManager.js';

const router = express.Router();

// 서비스 인스턴스 생성
const templateManager = new TemplateManager();

/**
 * GET /api/templates
 * 사용 가능한 템플릿 목록을 조회합니다.
 */
router.get('/templates', async (req, res) => {
  try {
    // TemplateManager를 사용하여 템플릿 목록 조회
    const templates = await templateManager.listTemplates();

    // 템플릿 목록 반환
    res.json({
      templates
    });

  } catch (error) {
    console.error('템플릿 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '템플릿 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
