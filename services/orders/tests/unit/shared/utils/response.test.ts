import { success, error, badRequest, notFound, internalError, created, ok } from '../../../../src/shared/utils/response';

describe('Response Utilities', () => {
  describe('success', () => {
    test('should create success response with 200 status', () => {
      const data = { id: '123', name: 'Test' };
      const result = success(200, data, 'Success message');

      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Content-Type', 'application/json');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');

      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.message).toBe('Success message');
    });

    test('should use default message when not provided', () => {
      const result = success(200, { test: 'data' });
      const body = JSON.parse(result.body);

      expect(body.message).toBe('Success');
    });
  });

  describe('error', () => {
    test('should create error response with correct structure', () => {
      const result = error(500, 'Error occurred', { detail: 'something' }, 'ERROR_CODE');

      expect(result.statusCode).toBe(500);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Error occurred');
      expect(body.error.code).toBe('ERROR_CODE');
      expect(body.error.details).toEqual({ detail: 'something' });
    });

    test('should create default error code when not provided', () => {
      const result = error(400, 'Bad request');
      const body = JSON.parse(result.body);

      expect(body.error.code).toBe('ERROR_400');
    });
  });

  describe('badRequest', () => {
    test('should create 400 response', () => {
      const result = badRequest('Invalid input', ['error1', 'error2']);

      expect(result.statusCode).toBe(400);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Invalid input');
      expect(body.error.code).toBe('BAD_REQUEST');
    });

    test('should use default message', () => {
      const result = badRequest();
      const body = JSON.parse(result.body);

      expect(body.message).toBe('Bad Request');
    });
  });

  describe('notFound', () => {
    test('should create 404 response', () => {
      const result = notFound('Resource not found');

      expect(result.statusCode).toBe(404);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Resource not found');
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('internalError', () => {
    test('should create 500 response', () => {
      const result = internalError('Server error', { stack: 'trace' });

      expect(result.statusCode).toBe(500);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Server error');
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('created', () => {
    test('should create 201 response', () => {
      const data = { id: '123' };
      const result = created(data, 'Created successfully');

      expect(result.statusCode).toBe(201);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.message).toBe('Created successfully');
    });
  });

  describe('ok', () => {
    test('should create 200 response', () => {
      const data = { test: 'data' };
      const result = ok(data, 'OK');

      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
    });
  });

  describe('CORS headers', () => {
    test('should include CORS headers in all responses', () => {
      const successRes = success(200, {});
      const errorRes = error(500, 'Error');

      expect(successRes.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(errorRes.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });
  });
});