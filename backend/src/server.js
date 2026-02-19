// SA 산출물 Co-Pilot 백엔드 서버
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRouter from './routes/generate.js';
import saveRouter from './routes/save.js';
import downloadRouter from './routes/download.js';
import templatesRouter from './routes/templates.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
// CORS 설정 - 프론트엔드(포트 3000)에서의 요청 허용
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'SA 산출물 Co-Pilot API 서버' });
});

// API 라우트
app.use('/api', generateRouter);
app.use('/api', saveRouter);
app.use('/api', downloadRouter);
app.use('/api', templatesRouter);

// 404 핸들러 - 존재하지 않는 라우트
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 전역 오류 처리 미들웨어
app.use((err, req, res, next) => {
  // 오류 로그 출력 (내부 디버깅용)
  console.error('서버 오류 발생:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack
  });

  // 클라이언트에게는 내부 세부사항을 노출하지 않음
  res.status(err.status || 500).json({
    success: false,
    error: err.status === 400 
      ? err.message 
      : '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`   http://localhost:${PORT}`);
});
