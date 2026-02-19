# SA 산출물 Co-Pilot - Backend

Express 기반 백엔드 서버

## 설치

```bash
npm install
```

## 실행

```bash
# 개발 모드
npm start

# 테스트
npm test
```

## API 엔드포인트

- `POST /api/generate` - 산출물 생성
- `POST /api/save` - 산출물 저장
- `GET /api/download/:filename` - 산출물 다운로드
- `GET /api/templates` - 템플릿 목록 조회

## 환경 변수

`.env.example` 파일을 `.env`로 복사하여 설정하세요.
