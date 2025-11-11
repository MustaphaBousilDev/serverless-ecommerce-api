import express from 'express';
import { handler as registerHandler } from './src/handlers/register';
import { handler as confirmHandler } from './src/handlers/confirmRegistration';
import { handler as loginHandler } from './src/handlers/login';
import { handler as refreshHandler } from './src/handlers/refreshToken';
import { handler as logoutHandler } from './src/handlers/logout';
import { handler as forgotPasswordHandler } from './src/handlers/forgotPassword';
import { handler as resetPasswordHandler } from './src/handlers/resetPassword';
import { handler as changePasswordHandler } from './src/handlers/changePassword';
import { handler as getProfileHandler } from './src/handlers/getProfile';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

function createMockEvent(req: express.Request, method: string): any {
  return {
    httpMethod: method,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query,
    headers: req.headers,
    body: req.body ? JSON.stringify(req.body) : null,
    isBase64Encoded: false,
    requestContext: {
      requestId: `local-${Date.now()}`,
      accountId: '123456789012',
      stage: 'local',
      requestTime: new Date().toISOString(),
      requestTimeEpoch: Date.now(),
      identity: {
        sourceIp: '127.0.0.1'
      }
    } as any
  } as any;
}


app.post('/auth/register', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await registerHandler(mockEvent, {} as any, {} as any);
    res.json({
        data: result
    })
  } catch (error: any) {
     res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.post('/auth/confirm', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await confirmHandler(mockEvent, {} as any, {} as any);
    res.json({
        data: result
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await loginHandler(mockEvent, {} as any, {} as any);
    res.json({
        data: result
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await refreshHandler(mockEvent, {} as any, {} as any);
    res.json({
        data: result
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await logoutHandler(mockEvent, {} as any, {} as any);
    res.json({
        data: result
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/forgot-password', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await forgotPasswordHandler(mockEvent, {} as any, {} as any);
    res.json({
        data: result
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/reset-password', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await resetPasswordHandler(mockEvent, {} as any, {} as any);
    res.json({
        data: result
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/change-password', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await changePasswordHandler(mockEvent, {} as any, {} as any);
    res.json({
        data: result
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/auth/profile', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'GET');
    const result = await getProfileHandler(mockEvent, {} as any, {} as any);
    return result;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;  // Different port from orders service
app.listen(PORT, () => {
  console.log(`\n🔐 Auth Service - Local API Server Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST   http://localhost:${PORT}/auth/register`);
  console.log(`  POST   http://localhost:${PORT}/auth/confirm`);
  console.log(`  POST   http://localhost:${PORT}/auth/login`);
  console.log(`  POST   http://localhost:${PORT}/auth/refresh`);
  console.log(`  POST   http://localhost:${PORT}/auth/logout`);
  console.log(`  POST   http://localhost:${PORT}/auth/forgot-password`);
  console.log(`  POST   http://localhost:${PORT}/auth/reset-password`);
  console.log(`  POST   http://localhost:${PORT}/auth/change-password`);
  console.log(`  GET    http://localhost:${PORT}/auth/profile`);
  console.log(`\n✅ Using REAL AWS Cognito User Pool\n`);
  console.log(`📋 User Pool ID: ${process.env.COGNITO_USER_POOL_ID}\n`);
});