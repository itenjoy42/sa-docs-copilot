# Design Document

## Overview

SA 산출물 Co-Pilot은 내부 팀원들이 SA(Solutions Architecture) 산출물을 빠르고 일관되게 작성할 수 있도록 지원하는 웹 애플리케이션입니다. 사용자가 프로젝트 정보를 입력하면 템플릿 기반으로 LLM을 활용하여 Markdown 형식의 산출물 초안을 자동 생성합니다.

시스템은 React 기반 프론트엔드(포트 3000)와 Node.js/Express 기반 백엔드(포트 5000)로 구성되며, 데이터베이스 없이 파일 시스템을 사용하여 템플릿과 생성된 산출물을 관리합니다. LLM 서비스가 사용 불가능한 경우 데모 모드로 샘플 콘텐츠를 생성할 수 있습니다.

## Architecture

### 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                          │
│                     (React SPA - Port 3000)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Backend Server                             │
│                (Node.js/Express - Port 5000)                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   API        │  │  Template    │  │  Draft       │     │
│  │   Routes     │  │  Manager     │  │  Generator   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐      ┌──────▼──────┐
        │  File System   │      │ LLM Service │
        │  (Templates &  │      │  (Optional) │
        │   Outputs)     │      └─────────────┘
        └────────────────┘
```

### 기술 스택

**Frontend:**
- React 18
- Tailwind CSS
- Axios (HTTP 클라이언트)
- React Markdown (미리보기)

**Backend:**
- Node.js
- Express
- File System (fs/promises)
- LLM SDK (선택적)

### 디렉토리 구조

```
project-root/
├── frontend/                 # React 애플리케이션
│   ├── src/
│   │   ├── components/      # UI 컴포넌트
│   │   ├── services/        # API 호출 로직
│   │   ├── App.jsx          # 메인 애플리케이션
│   │   └── index.jsx        # 엔트리 포인트
│   └── package.json
│
├── backend/                  # Express 서버
│   ├── src/
│   │   ├── routes/          # API 라우트
│   │   ├── services/        # 비즈니스 로직
│   │   ├── templates/       # JSON 템플릿 파일
│   │   ├── outputs/         # 생성된 산출물
│   │   └── server.js        # 서버 엔트리 포인트
│   └── package.json
│
└── .env                      # 환경 변수
```

## Components and Interfaces

### Frontend Components

#### 1. App Component
메인 애플리케이션 컴포넌트로 전체 레이아웃과 상태를 관리합니다.

**상태:**
- `formData`: 사용자 입력 데이터
- `generatedDraft`: 생성된 산출물
- `isLoading`: 로딩 상태
- `validationErrors`: 검증 오류 목록
- `validationWarnings`: 품질 경고 목록

**주요 메서드:**
- `handleInputChange(field, value)`: 입력 필드 변경 처리
- `handleSubmit()`: 산출물 생성 요청
- `handleSave()`: 서버에 산출물 저장
- `handleDownload()`: 산출물 다운로드
- `handleCopy()`: 클립보드에 복사

#### 2. InputForm Component
사용자 입력을 받는 폼 컴포넌트입니다.

**Props:**
- `formData`: 현재 폼 데이터
- `onChange`: 입력 변경 핸들러
- `onSubmit`: 제출 핸들러
- `errors`: 검증 오류 객체

**입력 필드:**
- 프로젝트 요약 (textarea)
- 핵심 요구사항 (textarea)
- 문서 톤 (select: 공식적/기술적/간결함)
- 산출물 타입 (select: 3가지 MVP 타입)

#### 3. DraftPreview Component
생성된 산출물을 미리보기하는 컴포넌트입니다.

**Props:**
- `content`: Markdown 콘텐츠
- `warnings`: 품질 경고 목록
- `onSave`: 저장 핸들러
- `onDownload`: 다운로드 핸들러
- `onCopy`: 복사 핸들러
- `onRegenerate`: 재생성 핸들러

**기능:**
- Markdown 렌더링
- 경고 메시지 표시
- 액션 버튼 (저장/다운로드/복사/재생성)

#### 4. LoadingSpinner Component
로딩 상태를 표시하는 컴포넌트입니다.

### Backend Services

#### 1. Template Manager
템플릿 파일을 관리하는 서비스입니다.

```javascript
class TemplateManager {
  // 템플릿 로드
  async loadTemplate(deliverableType)
  
  // 모든 템플릿 목록 조회
  async listTemplates()
  
  // 템플릿 검증
  validateTemplate(template)
}
```

**템플릿 구조:**
```json
{
  "type": "deliverable-type-name",
  "name": "산출물 타입 이름",
  "commonSections": [
    {
      "title": "섹션 제목",
      "required": true,
      "description": "섹션 설명"
    }
  ],
  "specificSections": [
    {
      "title": "타입별 섹션",
      "required": false,
      "description": "섹션 설명"
    }
  ],
  "rules": [
    "작성 규칙 1",
    "작성 규칙 2"
  ]
}
```

#### 2. Draft Generator
산출물 초안을 생성하는 서비스입니다.

```javascript
class DraftGenerator {
  // 산출물 생성
  async generateDraft(userInput, template, useLLM)
  
  // LLM 프롬프트 생성
  createPrompt(userInput, template)
  
  // LLM 호출
  async callLLM(prompt)
  
  // 데모 모드 콘텐츠 생성
  generateDemoContent(userInput, template)
}
```

**프롬프트 구조:**
```
당신은 AWS Solutions Architect입니다. 다음 정보를 바탕으로 {산출물 타입}을 작성해주세요.

프로젝트 요약: {사용자 입력}
핵심 요구사항: {사용자 입력}
문서 톤: {사용자 선택}

다음 섹션을 포함해야 합니다:
- {섹션 1}
- {섹션 2}
...

작성 규칙:
- {규칙 1}
- {규칙 2}
...

Markdown 형식으로 작성해주세요.
```

#### 3. Validator
생성된 산출물의 품질을 검증하는 서비스입니다.

```javascript
class Validator {
  // 입력 검증
  validateInput(formData)
  
  // 산출물 검증
  validateDraft(draft, template)
  
  // 필수 섹션 확인
  checkRequiredSections(draft, template)
  
  // Markdown 형식 검증
  validateMarkdown(content)
}
```

#### 4. File Manager
파일 시스템 작업을 처리하는 서비스입니다.

```javascript
class FileManager {
  // 산출물 저장
  async saveDraft(content, metadata)
  
  // 산출물 로드
  async loadDraft(filename)
  
  // 고유 파일명 생성
  generateUniqueFilename(deliverableType)
  
  // 파일 목록 조회
  async listDrafts()
}
```

### API Endpoints

#### POST /api/generate
산출물 초안을 생성합니다.

**Request:**
```json
{
  "projectSummary": "프로젝트 요약",
  "coreRequirements": "핵심 요구사항",
  "documentTone": "formal|technical|concise",
  "deliverableType": "type1|type2|type3",
  "useLLM": true
}
```

**Response (성공):**
```json
{
  "success": true,
  "draft": "# 산출물 제목\n\n...",
  "warnings": [
    "Assumptions/Risks 섹션이 누락되었습니다."
  ]
}
```

**Response (오류):**
```json
{
  "success": false,
  "error": "오류 메시지",
  "validationErrors": {
    "projectSummary": "프로젝트 요약은 필수입니다."
  }
}
```

#### POST /api/save
생성된 산출물을 서버에 저장합니다.

**Request:**
```json
{
  "content": "Markdown 콘텐츠",
  "deliverableType": "type1",
  "metadata": {
    "projectSummary": "프로젝트 요약",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "filename": "type1_20250115_103000.md",
  "path": "/outputs/type1_20250115_103000.md"
}
```

#### GET /api/download/:filename
저장된 산출물을 다운로드합니다.

**Response:**
- Content-Type: text/markdown
- Content-Disposition: attachment; filename="..."
- Body: Markdown 파일 내용

#### GET /api/templates
사용 가능한 템플릿 목록을 조회합니다.

**Response:**
```json
{
  "templates": [
    {
      "type": "type1",
      "name": "산출물 타입 1"
    },
    {
      "type": "type2",
      "name": "산출물 타입 2"
    },
    {
      "type": "type3",
      "name": "산출물 타입 3"
    }
  ]
}
```

## Data Models

### FormData
사용자 입력 데이터 모델입니다.

```typescript
interface FormData {
  projectSummary: string;      // 프로젝트 요약 (필수)
  coreRequirements: string;    // 핵심 요구사항 (필수)
  documentTone: 'formal' | 'technical' | 'concise';  // 문서 톤 (필수)
  deliverableType: 'type1' | 'type2' | 'type3';      // 산출물 타입 (필수)
}
```

### Template
산출물 템플릿 모델입니다.

```typescript
interface Template {
  type: string;                // 산출물 타입 식별자
  name: string;                // 산출물 타입 이름
  commonSections: Section[];   // 공통 섹션
  specificSections: Section[]; // 타입별 섹션
  rules: string[];             // 작성 규칙
}

interface Section {
  title: string;               // 섹션 제목
  required: boolean;           // 필수 여부
  description: string;         // 섹션 설명
}
```

### Draft
생성된 산출물 모델입니다.

```typescript
interface Draft {
  content: string;             // Markdown 콘텐츠
  deliverableType: string;     // 산출물 타입
  metadata: DraftMetadata;     // 메타데이터
  warnings: string[];          // 품질 경고
}

interface DraftMetadata {
  projectSummary: string;      // 프로젝트 요약
  coreRequirements: string;    // 핵심 요구사항
  documentTone: string;        // 문서 톤
  createdAt: string;           // 생성 시각 (ISO 8601)
  usedLLM: boolean;            // LLM 사용 여부
}
```

### ValidationResult
검증 결과 모델입니다.

```typescript
interface ValidationResult {
  isValid: boolean;            // 검증 통과 여부
  errors: ValidationError[];   // 오류 목록
  warnings: string[];          // 경고 목록
}

interface ValidationError {
  field: string;               // 오류 필드
  message: string;             // 오류 메시지
}
```

## Correctness Properties

*속성(Property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작입니다. 본질적으로 시스템이 무엇을 해야 하는지에 대한 형식적 진술입니다. 속성은 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다.*

### Property 1: 유효한 입력 수락
*모든* 필수 필드가 채워진 입력 데이터에 대해, 시스템은 해당 입력을 수락하고 산출물 생성을 진행해야 합니다.

**Validates: Requirements 1.3**

### Property 2: 무효한 입력 거부
*모든* 필수 필드 중 하나 이상이 누락된 입력 데이터에 대해, 시스템은 검증 오류를 반환하고 산출물 생성을 거부해야 합니다.

**Validates: Requirements 1.4**

### Property 3: 템플릿 로딩 정확성
*모든* 산출물 타입에 대해, 시스템은 해당 타입에 맞는 올바른 템플릿을 로드해야 합니다.

**Validates: Requirements 2.1**

### Property 4: 프롬프트 생성 완전성
*모든* 유효한 사용자 입력과 템플릿에 대해, 생성된 LLM 프롬프트는 사용자 입력의 모든 필드와 템플릿의 모든 섹션 정보를 포함해야 합니다.

**Validates: Requirements 2.2**

### Property 5: Markdown 형식 유효성
*모든* 생성된 산출물에 대해, 콘텐츠는 유효한 Markdown 형식이어야 합니다 (파싱 가능해야 함).

**Validates: Requirements 2.5**

### Property 6: 파일 저장 정확성
*모든* 산출물에 대해, 서버에 저장할 때 시스템은 outputs 디렉토리에 고유한 파일명으로 저장해야 하며, 저장 후 해당 파일을 읽었을 때 원본 콘텐츠와 동일해야 합니다.

**Validates: Requirements 3.2, 3.5**

### Property 7: 다운로드 기능 정확성
*모든* 저장된 산출물에 대해, 다운로드 API는 올바른 Content-Type 헤더와 함께 원본 파일 내용을 반환해야 합니다.

**Validates: Requirements 3.3**

### Property 8: 필수 섹션 검증
*모든* 생성된 산출물과 템플릿에 대해, 검증 로직은 템플릿에 정의된 모든 필수 섹션의 존재 여부를 정확히 판단해야 합니다.

**Validates: Requirements 4.1**

### Property 9: 템플릿 Round-trip 일관성
*모든* 유효한 템플릿 객체에 대해, JSON으로 직렬화한 후 다시 역직렬화하면 원본과 동일한 템플릿 객체가 생성되어야 합니다.

**Validates: Requirements 5.1, 5.2**

### Property 10: POST 엔드포인트 응답 정확성
*모든* 유효한 입력에 대해, POST /api/generate 엔드포인트는 성공 응답과 함께 Markdown 형식의 산출물을 반환해야 합니다.

**Validates: Requirements 7.1**

### Property 11: GET 엔드포인트 응답 정확성
*모든* 존재하는 파일명에 대해, GET /api/download/:filename 엔드포인트는 올바른 파일 내용을 반환해야 합니다.

**Validates: Requirements 7.2**

### Property 12: API 오류 처리
*모든* 무효한 입력에 대해, API 엔드포인트는 적절한 HTTP 상태 코드와 함께 설명적인 오류 메시지를 반환해야 합니다.

**Validates: Requirements 7.3**

## Error Handling

### Frontend Error Handling

#### 1. 입력 검증 오류
- 필수 필드 누락 시 필드 아래에 빨간색 오류 메시지 표시
- 제출 버튼 비활성화
- 사용자가 오류를 수정하면 실시간으로 검증 상태 업데이트

#### 2. API 호출 오류
- 네트워크 오류: "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요."
- 타임아웃: "요청 시간이 초과되었습니다. 다시 시도해주세요."
- 서버 오류: 서버에서 반환한 오류 메시지 표시

#### 3. 사용자 피드백
- 모든 오류는 화면 상단에 알림 형태로 표시
- 자동으로 사라지지 않고 사용자가 닫기 버튼을 클릭해야 함
- 오류 유형에 따라 색상 구분 (오류: 빨강, 경고: 노랑)

### Backend Error Handling

#### 1. 입력 검증 오류
```javascript
// HTTP 400 Bad Request
{
  "success": false,
  "error": "입력 검증 실패",
  "validationErrors": {
    "projectSummary": "프로젝트 요약은 필수입니다.",
    "deliverableType": "유효하지 않은 산출물 타입입니다."
  }
}
```

#### 2. 파일 시스템 오류
```javascript
// HTTP 500 Internal Server Error
{
  "success": false,
  "error": "파일 저장 중 오류가 발생했습니다."
}
```

템플릿 파일을 찾을 수 없는 경우:
```javascript
// HTTP 404 Not Found
{
  "success": false,
  "error": "요청한 템플릿을 찾을 수 없습니다."
}
```

#### 3. LLM 서비스 오류
- LLM API 호출 실패 시 자동으로 데모 모드로 전환
- 사용자에게 데모 모드로 생성되었음을 알림
- 로그에 오류 기록

#### 4. 전역 오류 처리
```javascript
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  });
});
```

### 로깅 전략

#### 1. 오류 로그
- 모든 오류는 콘솔에 기록
- 타임스탬프, 요청 정보, 오류 스택 포함
- 민감한 정보는 로그에서 제외

#### 2. 액세스 로그
- 모든 API 요청 기록
- 요청 메서드, 경로, 상태 코드, 응답 시간

#### 3. 비즈니스 로그
- 산출물 생성 성공/실패
- LLM 사용 여부
- 파일 저장 성공/실패

## Testing Strategy

### 단위 테스트 (Unit Tests)

단위 테스트는 특정 예제, 엣지 케이스, 오류 조건을 검증합니다.

#### Backend 단위 테스트
- Template Manager: 템플릿 로드, 검증
- Draft Generator: 프롬프트 생성, 데모 콘텐츠 생성
- Validator: 입력 검증, 산출물 검증
- File Manager: 파일 저장, 로드, 파일명 생성

**예제 테스트:**
- LLM 사용 가능 시 LLM 사용 (Requirements 2.3)
- LLM 사용 불가능 시 데모 모드 사용 (Requirements 2.4)
- "Assumptions/Risks" 섹션 누락 시 특정 경고 표시 (Requirements 4.3)
- 템플릿 파일 수정 후 업데이트된 템플릿 사용 (Requirements 5.3)
- 서버 오류 시 내부 세부사항 노출하지 않음 (Requirements 7.4)

#### Frontend 단위 테스트
- 컴포넌트 렌더링
- 이벤트 핸들러
- 상태 관리

### 속성 기반 테스트 (Property-Based Tests)

속성 기반 테스트는 많은 생성된 입력에 걸쳐 보편적 속성을 검증합니다. 각 속성 테스트는 최소 100회 반복 실행되어야 합니다.

**테스트 라이브러리:**
- Backend: fast-check (JavaScript/Node.js용 속성 기반 테스트 라이브러리)
- Frontend: fast-check + React Testing Library

**속성 테스트 태그 형식:**
```javascript
// Feature: sa-deliverable-copilot, Property 1: 유효한 입력 수락
```

각 correctness property는 하나의 속성 기반 테스트로 구현되어야 합니다:

1. **Property 1**: 유효한 입력 수락 테스트
2. **Property 2**: 무효한 입력 거부 테스트
3. **Property 3**: 템플릿 로딩 정확성 테스트
4. **Property 4**: 프롬프트 생성 완전성 테스트
5. **Property 5**: Markdown 형식 유효성 테스트
6. **Property 6**: 파일 저장 정확성 테스트
7. **Property 7**: 다운로드 기능 정확성 테스트
8. **Property 8**: 필수 섹션 검증 테스트
9. **Property 9**: 템플릿 Round-trip 일관성 테스트
10. **Property 10**: POST 엔드포인트 응답 정확성 테스트
11. **Property 11**: GET 엔드포인트 응답 정확성 테스트
12. **Property 12**: API 오류 처리 테스트

### 통합 테스트

전체 API 플로우를 테스트합니다:
- 산출물 생성 → 저장 → 다운로드 플로우
- 오류 발생 → 재생성 플로우

### 테스트 실행

```bash
# Backend 테스트
cd backend
npm test

# Frontend 테스트
cd frontend
npm test

# 모든 테스트 실행
npm run test:all
```

### 테스트 커버리지 목표

- 단위 테스트: 핵심 비즈니스 로직 80% 이상
- 속성 기반 테스트: 모든 correctness properties 커버
- 통합 테스트: 주요 사용자 플로우 커버
