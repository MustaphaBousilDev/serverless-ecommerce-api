// local-server.ts
import express from 'express';
import { handler as createOrderHandler } from './src/handlers/http/createOrder';
import { handler as getOrderHandler } from './src/handlers/http/getOrder';
import { handler as listOrdersHandler } from './src/handlers/http/listOrders';

const app = express();
app.use(express.json());

// Mock API Gateway event creator
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

// Routes
app.post('/orders', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'POST');
    const result = await createOrderHandler(mockEvent);
    res.status(result.statusCode)
       .set(result.headers || {})
       .send(result.body);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/orders/:orderId', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'GET');
    const result = await getOrderHandler(mockEvent);
    res.status(result.statusCode)
       .set(result.headers || {})
       .send(result.body);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const mockEvent = createMockEvent(req, 'GET');
    const result = await listOrdersHandler(mockEvent);
    res.status(result.statusCode)
       .set(result.headers || {})
       .send(result.body);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Local API Server Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST   http://localhost:${PORT}/orders`);
  console.log(`  GET    http://localhost:${PORT}/orders/:orderId`);
  console.log(`  GET    http://localhost:${PORT}/orders?userId=xxx`);
  console.log(`\n✅ Using REAL AWS DynamoDB (table: dev-orders)\n`);
});
