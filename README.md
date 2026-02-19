# SA 산출물 Co-Pilot

AWS Solutions Architecture 산출물을 자동으로 생성하는 웹 애플리케이션입니다.

## 🎯 주요 기능

- 프로젝트 정보 입력 및 검증
- 3가지 타입의 SA 산출물 자동 생성
  - 아키텍처 설계서
  - 기술 제안서
  - 마이그레이션 계획서
- Markdown 형식 미리보기
- 서버 저장 및 다운로드
- 클립보드 복사
- 품질 검증 및 재생성

## 🏗️ 기술 스택

### Frontend
- React 18
- Tailwind CSS
- Axios
- React Markdown

### Backend
- Node.js
- Express
- File System (템플릿 및 산출물 관리)

## 📦 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/sa-docs-copilot.git
cd sa-docs-copilot

# Backend 설치
cd backend
npm install

# Frontend 설치
cd ../frontend
npm install
```

### 환경 변수 설정

```bash
# Backend 환경 변수
cp backend/.env.example backend/.env

# Frontend 환경 변수
cp frontend/.env.example frontend/.env
```

### 실행

```bash
# Backend 서버 실행 (포트 5000)
cd backend
npm start

# Frontend 서버 실행 (포트 3000)
cd frontend
npm start
```

브라우저에서 http://localhost:3000 으로 접속

## 📚 문서

- [요구사항 명세서](docs/REQUIREMENTS.md)
- [설계 문서](docs/DESIGN.md)
- [구현 계획](docs/TASKS.md)
- [통합 테스트 결과](docs/INTEGRATION_TEST.md)
- [최종 검증 결과](docs/FINAL_VERIFICATION.md)

## 🧪 테스트

```bash
# Backend 테스트
cd backend
npm test

# Frontend 테스트
cd frontend
npm test
```

## 📁 프로젝트 구조

```
sa-docs-copilot/
├── backend/          # Express 백엔드 서버
│   ├── src/
│   │   ├── routes/   # API 라우트
│   │   ├── services/ # 비즈니스 로직
│   │   ├── templates/# 산출물 템플릿
│   │   └── outputs/  # 생성된 산출물
│   └── package.json
│
├── frontend/         # React 프론트엔드
│   ├── src/
│   │   ├── components/ # UI 컴포넌트
│   │   ├── services/   # API 호출
│   │   └── App.jsx
│   └── package.json
│
└── docs/            # 프로젝트 문서
```

## 🔒 보안 주의사항

- 고객 정보, 계정 정보 등 민감한 데이터를 입력하지 마세요
- 내부 네트워크에서만 사용하세요
- 환경 변수 파일(.env)을 GitHub에 올리지 마세요

## 📄 라이선스

MIT License

## 👥 기여

이슈와 풀 리퀘스트를 환영합니다!

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
