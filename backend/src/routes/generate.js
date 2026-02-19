import express from 'express';
import Validator from '../services/Validator.js';
import TemplateManager from '../services/TemplateManager.js';
import DraftGenerator from '../services/DraftGenerator.js';

const router = express.Router();

// 서비스 인스턴스 생성
const validator = new Validator();
const templateManager = new TemplateManager();
const draftGenerator = new DraftGenerator();

/**
 * POST /api/generate
 * 산출물 초안을 생성합니다.
 */
router.post('/generate', async (req, res) => {
  try {
    const { projectSummary, coreRequirements, documentTone, deliverableType, useLLM = false } = req.body;

    // 1. 입력 데이터 검증
    const validationResult = validator.validateInput({
      projectSummary,
      coreRequirements,
      documentTone,
      deliverableType
    });

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: '입력 검증 실패',
        validationErrors: validationResult.errors
      });
    }

    // 2. 템플릿 로드
    let template;
    try {
      template = await templateManager.loadTemplate(deliverableType);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // 3. Draft Generator 호출하여 산출물 생성
    const draft = await draftGenerator.generateDraft(
      { projectSummary, coreRequirements, documentTone },
      template,
      useLLM
    );

    // 4. 생성된 산출물 검증 및 경고 생성
    const draftValidation = validator.validateDraft(draft, template);
    const warnings = draftValidation.warnings;

    // 5. 성공 응답 반환
    res.json({
      success: true,
      draft,
      warnings
    });

  } catch (error) {
    console.error('산출물 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

export default router;
