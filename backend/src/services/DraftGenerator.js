/**
 * Draft Generator 서비스
 * LLM 또는 데모 모드를 사용하여 산출물 초안을 생성하는 기능을 제공합니다.
 */
class DraftGenerator {
  /**
   * 산출물 초안을 생성합니다.
   * @param {Object} userInput - 사용자 입력 데이터
   * @param {string} userInput.projectSummary - 프로젝트 요약
   * @param {string} userInput.coreRequirements - 핵심 요구사항
   * @param {string} userInput.documentTone - 문서 톤
   * @param {Object} template - 템플릿 객체
   * @param {boolean} useLLM - LLM 사용 여부 (기본값: false)
   * @returns {Promise<string>} 생성된 산출물 (Markdown 형식)
   */
  async generateDraft(userInput, template, useLLM = false) {
    try {
      // LLM 사용 시도
      if (useLLM) {
        try {
          const prompt = this.createPrompt(userInput, template);
          const llmResult = await this.callLLM(prompt);
          
          if (llmResult) {
            return llmResult;
          }
        } catch (error) {
          console.warn('LLM 호출 실패, 데모 모드로 전환:', error.message);
        }
      }

      // LLM 사용 불가능 시 데모 모드로 콘텐츠 생성
      return this.generateDemoContent(userInput, template);
    } catch (error) {
      throw new Error(`산출물 생성 실패: ${error.message}`);
    }
  }

  /**
   * LLM 프롬프트를 생성합니다.
   * @param {Object} userInput - 사용자 입력 데이터
   * @param {Object} template - 템플릿 객체
   * @returns {string} 생성된 프롬프트
   */
  createPrompt(userInput, template) {
    const { projectSummary, coreRequirements, documentTone } = userInput;
    
    // 문서 톤 설명 매핑
    const toneDescriptions = {
      formal: '공식적이고 격식있는',
      technical: '기술적이고 상세한',
      concise: '간결하고 핵심적인'
    };

    const toneDescription = toneDescriptions[documentTone] || '전문적인';

    // 모든 섹션 수집
    const allSections = [
      ...template.commonSections,
      ...template.specificSections
    ];

    // 섹션 목록 생성
    const sectionList = allSections
      .map(section => `- ${section.title}${section.required ? ' (필수)' : ''}: ${section.description}`)
      .join('\n');

    // 작성 규칙 목록 생성
    const rulesList = template.rules
      .map((rule, index) => `${index + 1}. ${rule}`)
      .join('\n');

    // 프롬프트 생성
    const prompt = `당신은 AWS Solutions Architect입니다. 다음 정보를 바탕으로 "${template.name}"을 작성해주세요.

**프로젝트 요약:**
${projectSummary}

**핵심 요구사항:**
${coreRequirements}

**문서 톤:** ${toneDescription} 스타일로 작성

**포함해야 할 섹션:**
${sectionList}

**작성 규칙:**
${rulesList}

위 정보를 바탕으로 전문적이고 실용적인 ${template.name}을 Markdown 형식으로 작성해주세요.
각 섹션은 ## (H2) 헤더를 사용하고, 구체적이고 실행 가능한 내용을 포함해야 합니다.`;

    return prompt;
  }

  /**
   * LLM 서비스를 호출합니다.
   * @param {string} prompt - LLM에 전달할 프롬프트
   * @returns {Promise<string|null>} LLM 응답 또는 null (실패 시)
   */
  async callLLM(prompt) {
    // 현재는 LLM 서비스가 구성되지 않았으므로 null 반환
    // 실제 LLM 서비스 연동 시 이 메서드를 구현합니다.
    
    // 예시 구현:
    // const response = await llmClient.generate({
    //   prompt: prompt,
    //   maxTokens: 2000,
    //   temperature: 0.7
    // });
    // return response.text;

    console.log('LLM 서비스가 구성되지 않았습니다.');
    return null;
  }

  /**
   * 데모 모드로 샘플 콘텐츠를 생성합니다.
   * @param {Object} userInput - 사용자 입력 데이터
   * @param {Object} template - 템플릿 객체
   * @returns {string} 생성된 샘플 콘텐츠 (Markdown 형식)
   */
  generateDemoContent(userInput, template) {
    const { projectSummary, coreRequirements, documentTone } = userInput;
    
    // 문서 제목
    let content = `# ${template.name}\n\n`;
    content += `> 이 문서는 데모 모드로 생성된 샘플입니다.\n\n`;
    content += `**생성 일시:** ${new Date().toLocaleString('ko-KR')}\n\n`;
    content += `---\n\n`;

    // 모든 섹션 수집
    const allSections = [
      ...template.commonSections,
      ...template.specificSections
    ];

    // 각 섹션별 콘텐츠 생성
    for (const section of allSections) {
      content += `## ${section.title}\n\n`;
      
      // 섹션별 샘플 콘텐츠 생성
      content += this.generateSectionContent(section, userInput, template);
      content += `\n\n`;
    }

    // 참고사항 추가
    content += `---\n\n`;
    content += `## 참고사항\n\n`;
    content += `이 문서는 다음 정보를 바탕으로 생성되었습니다:\n\n`;
    content += `- **프로젝트 요약:** ${projectSummary}\n`;
    content += `- **핵심 요구사항:** ${coreRequirements}\n`;
    content += `- **문서 톤:** ${documentTone}\n`;

    return content;
  }

  /**
   * 특정 섹션의 샘플 콘텐츠를 생성합니다.
   * @param {Object} section - 섹션 정보
   * @param {Object} userInput - 사용자 입력 데이터
   * @param {Object} template - 템플릿 객체
   * @returns {string} 생성된 섹션 콘텐츠
   */
  generateSectionContent(section, userInput, template) {
    const { projectSummary, coreRequirements } = userInput;
    const sectionTitle = section.title.toLowerCase();

    // 섹션 제목에 따라 적절한 샘플 콘텐츠 생성
    if (sectionTitle.includes('개요') || sectionTitle.includes('overview')) {
      return `### 프로젝트 목적\n\n${projectSummary}\n\n### 주요 목표\n\n${coreRequirements}`;
    }

    if (sectionTitle.includes('현재 상황') || sectionTitle.includes('분석')) {
      return `### 현재 문제점\n\n- 기존 시스템의 확장성 부족\n- 수동 프로세스로 인한 비효율성\n- 데이터 관리 및 분석의 어려움\n\n### 개선 필요 사항\n\n- 자동화된 워크플로우 구축\n- 클라우드 기반 인프라로 전환\n- 실시간 데이터 처리 및 분석 기능`;
    }

    if (sectionTitle.includes('요구사항') || sectionTitle.includes('requirement')) {
      return `### 기능적 요구사항\n\n${coreRequirements}\n\n### 비기능적 요구사항\n\n- **성능:** 응답 시간 < 2초\n- **보안:** AWS IAM 기반 접근 제어\n- **확장성:** Auto Scaling 지원\n- **가용성:** 99.9% 이상`;
    }

    if (sectionTitle.includes('assumption') || sectionTitle.includes('risk')) {
      return `### 가정사항 (Assumptions)\n\n- AWS 서비스 사용에 대한 조직의 승인이 완료되었습니다.\n- 개발 팀은 AWS 서비스에 대한 기본 지식을 보유하고 있습니다.\n- 프로젝트 예산은 예상 AWS 비용을 충당할 수 있습니다.\n\n### 위험 요소 (Risks)\n\n- **기술적 위험:** 새로운 AWS 서비스 학습 곡선\n- **일정 위험:** 예상보다 긴 마이그레이션 시간\n- **비용 위험:** 초기 예상을 초과하는 AWS 비용 발생 가능성\n\n### 완화 방안\n\n- AWS 교육 프로그램 참여\n- 단계별 마이그레이션 계획 수립\n- AWS Cost Explorer를 통한 비용 모니터링`;
    }

    if (sectionTitle.includes('아키텍처') || sectionTitle.includes('architecture')) {
      return `### 시스템 구조\n\n\`\`\`\n[사용자] → [CloudFront] → [ALB] → [ECS/Fargate]\n                                    ↓\n                              [RDS/Aurora]\n                                    ↓\n                              [S3 Bucket]\n\`\`\`\n\n### 주요 컴포넌트\n\n- **프론트엔드:** React 기반 SPA, CloudFront로 배포\n- **백엔드:** Node.js/Express, ECS Fargate에서 실행\n- **데이터베이스:** Amazon Aurora (MySQL 호환)\n- **스토리지:** S3 (정적 파일 및 백업)\n\n### 데이터 흐름\n\n1. 사용자 요청이 CloudFront를 통해 전달됩니다.\n2. ALB가 요청을 ECS 컨테이너로 라우팅합니다.\n3. 백엔드 서비스가 Aurora 데이터베이스를 조회합니다.\n4. 결과를 JSON 형식으로 반환합니다.`;
    }

    if (sectionTitle.includes('기술 스택') || sectionTitle.includes('tech')) {
      return `### AWS 서비스\n\n- **컴퓨팅:** Amazon ECS (Fargate)\n- **데이터베이스:** Amazon Aurora MySQL\n- **스토리지:** Amazon S3\n- **네트워킹:** Amazon VPC, CloudFront, ALB\n- **보안:** AWS IAM, AWS Secrets Manager\n- **모니터링:** CloudWatch, X-Ray\n\n### 개발 스택\n\n- **프론트엔드:** React 18, Tailwind CSS\n- **백엔드:** Node.js 18, Express\n- **데이터베이스:** MySQL 8.0\n- **인프라 코드:** AWS CDK (TypeScript)`;
    }

    if (sectionTitle.includes('보안') || sectionTitle.includes('security')) {
      return `### 인증 및 인가\n\n- AWS Cognito를 통한 사용자 인증\n- IAM Role 기반 서비스 간 인증\n- JWT 토큰 기반 API 인증\n\n### 데이터 보안\n\n- 전송 중 암호화: TLS 1.3\n- 저장 시 암호화: S3 및 RDS 암호화 활성화\n- 민감 정보: AWS Secrets Manager 사용\n\n### 네트워크 보안\n\n- VPC 내 Private Subnet 구성\n- Security Group을 통한 트래픽 제어\n- WAF를 통한 웹 공격 방어`;
    }

    if (sectionTitle.includes('확장성') || sectionTitle.includes('성능') || sectionTitle.includes('scalability')) {
      return `### Auto Scaling\n\n- ECS Service Auto Scaling 설정\n- CPU 사용률 70% 이상 시 스케일 아웃\n- 최소 2개, 최대 10개 태스크\n\n### 로드 밸런싱\n\n- Application Load Balancer 사용\n- Health Check 설정으로 장애 감지\n\n### 캐싱 전략\n\n- CloudFront를 통한 정적 콘텐츠 캐싱\n- ElastiCache (Redis)를 통한 데이터 캐싱\n- TTL 설정으로 캐시 무효화 관리`;
    }

    if (sectionTitle.includes('비용') || sectionTitle.includes('cost')) {
      return `### 예상 월간 비용\n\n| 서비스 | 예상 비용 |\n|--------|----------|\n| ECS Fargate | $150 |\n| Aurora MySQL | $200 |\n| S3 | $50 |\n| CloudFront | $100 |\n| 기타 서비스 | $50 |\n| **합계** | **$550** |\n\n### 비용 최적화 방안\n\n- Reserved Instances 또는 Savings Plans 활용\n- S3 Lifecycle 정책으로 오래된 데이터 아카이빙\n- CloudWatch를 통한 비용 모니터링 및 알림 설정`;
    }

    if (sectionTitle.includes('구현') || sectionTitle.includes('implementation')) {
      return `### 구현 단계\n\n1. **Phase 1: 인프라 구축** (2주)\n   - VPC 및 네트워크 설정\n   - RDS Aurora 구성\n   - S3 버킷 생성\n\n2. **Phase 2: 애플리케이션 배포** (3주)\n   - ECS 클러스터 구성\n   - 백엔드 서비스 배포\n   - 프론트엔드 배포\n\n3. **Phase 3: 테스트 및 최적화** (2주)\n   - 성능 테스트\n   - 보안 검증\n   - 모니터링 설정`;
    }

    if (sectionTitle.includes('마이그레이션') || sectionTitle.includes('migration')) {
      return `### 마이그레이션 전략\n\n- **방식:** Blue-Green 배포\n- **데이터 마이그레이션:** AWS DMS 사용\n- **롤백 계획:** 기존 시스템 유지 (2주간)\n\n### 마이그레이션 단계\n\n1. 개발 환경 구축 및 테스트\n2. 스테이징 환경에서 검증\n3. 프로덕션 환경 배포\n4. 트래픽 점진적 전환`;
    }

    // 기본 샘플 콘텐츠
    return `${section.description}\n\n이 섹션은 프로젝트의 구체적인 요구사항에 따라 작성되어야 합니다.\n\n**주요 고려사항:**\n- ${projectSummary}\n- ${coreRequirements}`;
  }
}

export default DraftGenerator;
