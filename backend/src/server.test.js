// 전역 오류 처리 미들웨어 테스트
import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';

describe('전역 오류 처리 미들웨어', () => {
  // 테스트용 Express 앱 생성
  const createTestApp = () => {
    const app = express();
    app.use(express.json());

    // 테스트용 라우트
    app.get('/test/success', (req, res) => {
      res.json({ success: true, message: '성공' });
    });

    app.get('/test/error', (req, res, next) => {
      const error = new Error('테스트 오류');
      error.status = 500;
      next(error);
    });

    app.get('/test/validation-error', (req, res, next) => {
      const error = new Error('유효하지 않은 입력입니다.');
      error.status = 400;
      next(error);
    });

    // 404 핸들러
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: '요청한 리소스를 찾을 수 없습니다.'
      });
    });

    // 전역 오류 처리 미들웨어
    app.use((err, req, res, next) => {
      console.error('서버 오류 발생:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        error: err.message,
        stack: err.stack
      });

      res.status(err.status || 500).json({
        success: false,
        error: err.status === 400 
          ? err.message 
          : '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    });

    return app;
  };

  it('정상 요청은 성공 응답을 반환해야 함', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test/success');
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.success, true);
  });

  it('존재하지 않는 라우트는 404 오류를 반환해야 함', async () => {
    const app = createTestApp();
    const response = await request(app).get('/nonexistent');
    
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '요청한 리소스를 찾을 수 없습니다.');
  });

  it('서버 오류 발생 시 내부 세부사항을 노출하지 않아야 함', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test/error');
    
    assert.strictEqual(response.status, 500);
    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    // 내부 오류 메시지가 노출되지 않아야 함
    assert.ok(!response.body.error.includes('테스트 오류'));
  });

  it('검증 오류(400)는 설명적인 오류 메시지를 반환해야 함', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test/validation-error');
    
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.error, '유효하지 않은 입력입니다.');
  });

  it('모든 오류 응답은 일관된 형식을 가져야 함', async () => {
    const app = createTestApp();
    const responses = await Promise.all([
      request(app).get('/nonexistent'),
      request(app).get('/test/error'),
      request(app).get('/test/validation-error')
    ]);

    responses.forEach(response => {
      assert.ok(response.body.hasOwnProperty('success'));
      assert.ok(response.body.hasOwnProperty('error'));
      assert.strictEqual(response.body.success, false);
      assert.strictEqual(typeof response.body.error, 'string');
    });
  });
});
