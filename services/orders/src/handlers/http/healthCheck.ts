import { APIGatewayProxyHandler } from "aws-lambda";
import { CircuitBreakerManager } from "../../shared/utils/circuitBreaker";
import { createLogger, successResponse } from "../../shared";
import { DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TABLE_NAMES } from "../../infrastructure/config/aws-config";
import { getCorrelationId } from "../../shared/utils/correlationId";

export const handler: APIGatewayProxyHandler = async (event) => {
  const startTime = Date.now()
  const correlationId = getCorrelationId(event);
  const logger = createLogger(correlationId);
  const circuitMetrics = CircuitBreakerManager.getAllMetrics();
  //we will check dynamoDB connectivety
  let dynamoDBStatus = "healthy"
  let dynamoDBLatency = 0

  try {
    const dynamoDBStart  = Date.now()
    const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION })
    await dynamoDBClient.send(new DescribeTableCommand({
      TableName: TABLE_NAMES.ORDERS
    }))
    dynamoDBLatency = Date.now() - dynamoDBStart
  } catch(error) {
     dynamoDBStatus = 'unhealthy';
     logger.error('DynamoDB health check failed:', error)
  }

  // Determine overall health
  const hasOpenCircuits = circuitMetrics.some(m => m.state === 'OPEN');
  const isDynamoHealthy = dynamoDBStatus === 'healthy';
  let overallStatus = 'healthy';
  if (!isDynamoHealthy) {
    overallStatus = 'unhealthy';
  } else if (hasOpenCircuits) {
    overallStatus = 'degraded';
  }

  const health = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    service: 'orders-service',
    responseTime: Date.now() - startTime,
    
    version: '1.0.0',
    uptime: process.uptime(),
    dependencies: {
      dynamodb: {
        status: dynamoDBStatus,
        latency: dynamoDBLatency,
        table: TABLE_NAMES.ORDERS
      },
      eventBridge: {
        status: circuitMetrics.find(m => m.name === 'eventbridge')?.isHealthy ? 'healthy' : 'degraded',
        circuitState: circuitMetrics.find(m => m.name === 'eventbridge')?.state || 'CLOSED'
      }
    },
    circuitBreakers: circuitMetrics,
    environment: process.env.Environment || 'dev'
  };
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(health)
  }

};