import Validator from '../services/Validator.js';
import TemplateManager from '../services/TemplateManager.js';
import DraftGenerator from '../services/DraftGenerator.js';

/**
 * POST /api/generate 엔드포인트 테스트
 * 
 * 이 테스트는 엔드포인트의 핵심 로직을 검증합니다:
 * 1. 유효한 입력 데이터 검증
 * 2. 템플릿 로드
 * 3. 산출물 생성
 * 4. 생성된 산출물 검증
 */

// 서비스 인스턴스 생성
const validator = new Validator();
const templateManager = new TemplateManager();
const draftGenerator = new DraftGenerator();

/**
 * 테스트 1: 유효한 입력으로 산출물 생성 성공
 */
async function testValidInput() {
  console.log('\n=== 테스트 1: 유효한 입력으로 산출물 생성 ===');
  
  const validInput = {
    projectSummary: '전자상거래 플랫폼의 클라우드 마이그레이션',
    coreRequirements: '고가용성, 확장성, 보안',
    documentTone: 'technical',
    deliverableType: 'type1'
  };

  try {
    // 1. 입력 검증
    const validationResult = validator.validateInput(validInput);
    console.log('✓ 입력 검증:', validationResult.isValid ? '통과' : '실패');
    
    if (!validationResult.isValid) {
      console.error('검증 오류:', validationResult.errors);
      return false;
    }

    // 2. 템플릿 로드
    const template = await templateManager.loadTemplate(validInput.deliverableType);
    console.log('✓ 템플릿 로드 성공:', template.name);

    // 3. 산출물 생성
    const draft = await draftGenerator.generateDraft(
      {
        projectSummary: validInput.projectSummary,
        coreRequirements: validInput.coreRequirements,
        documentTone: validInput.documentTone
      },
      template,
      false
    );
    console.log('✓ 산출물 생성 성공 (길이:', draft.length, '자)');

    // 4. 산출물 검증
    const draftValidation = validator.validateDraft(draft, template);
    console.log('✓ 산출물 검증 완료');
    console.log('  - 경고 개수:', draftValidation.warnings.length);
    if (draftValidation.warnings.length > 0) {
      console.log('  - 경고 내용:', draftValidation.warnings);
    }

    return true;
  } catch (error) {
    console.error('✗ 테스트 실패:', error.message);
    return false;
  }
}

/**
 * 테스트 2: 무효한 입력으로 검증 실패
 */
async function testInvalidInput() {
  console.log('\n=== 테스트 2: 무효한 입력 검증 ===');
  
  const invalidInput = {
    projectSummary: '',  // 빈 값
    coreRequirements: 'test',
    documentTone: 'invalid',  // 유효하지 않은 값
    deliverableType: 'type1'
  };

  try {
    const validationResult = validator.validateInput(invalidInput);
    
    if (!validationResult.isValid) {
      console.log('✓ 예상대로 검증 실패');
      console.log('  - 오류:', validationResult.errors);
      return true;
    } else {
      console.error('✗ 무효한 입력이 통과됨 (예상치 못한 결과)');
      return false;
    }
  } catch (error) {
    console.error('✗ 테스트 실패:', error.message);
    return false;
  }
}

/**
 * 테스트 3: 존재하지 않는 템플릿 타입
 */
async function testInvalidTemplateType() {
  console.log('\n=== 테스트 3: 존재하지 않는 템플릿 타입 ===');
  
  try {
    await templateManager.loadTemplate('invalid_type');
    console.error('✗ 존재하지 않는 템플릿이 로드됨 (예상치 못한 결과)');
    return false;
  } catch (error) {
    console.log('✓ 예상대로 오류 발생:', error.message);
    return true;
  }
}

/**
 * 테스트 4: 모든 산출물 타입 테스트
 */
async function testAllDeliverableTypes() {
  console.log('\n=== 테스트 4: 모든 산출물 타입 테스트 ===');
  
  const types = ['type1', 'type2', 'type3'];
  let allPassed = true;

  for (const type of types) {
    try {
      const template = await templateManager.loadTemplate(type);
      console.log(`✓ ${type} 템플릿 로드 성공:`, template.name);
      
      const draft = await draftGenerator.generateDraft(
        {
          projectSummary: '테스트 프로젝트',
          coreRequirements: '테스트 요구사항',
          documentTone: 'formal'
        },
        template,
        false
      );
      
      const validation = validator.validateDraft(draft, template);
      console.log(`  - 산출물 생성 및 검증 완료 (경고: ${validation.warnings.length}개)`);
    } catch (error) {
      console.error(`✗ ${type} 테스트 실패:`, error.message);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * 모든 테스트 실행
 */
async function runAllTests() {
  console.log('========================================');
  console.log('POST /api/generate 엔드포인트 테스트 시작');
  console.log('========================================');

  const results = [];
  
  results.push(await testValidInput());
  results.push(await testInvalidInput());
  results.push(await testInvalidTemplateType());
  results.push(await testAllDeliverableTypes());

  console.log('\n========================================');
  console.log('테스트 결과 요약');
  console.log('========================================');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`통과: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✓ 모든 테스트 통과!');
  } else {
    console.log('✗ 일부 테스트 실패');
  }
}

// 테스트 실행
runAllTests().catch(console.error);
