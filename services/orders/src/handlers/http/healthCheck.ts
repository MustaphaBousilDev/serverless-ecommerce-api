import { APIGatewayProxyHandler } from "aws-lambda";
import { CircuitBreakerManager } from "../../shared/utils/circuitBreaker";
import { successResponse } from "../../shared";

export const handler: APIGatewayProxyHandler = async (event) => {
  const circuitMetrics = CircuitBreakerManager.getAllMetrics();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'orders-service',
    version: '1.0.0',
    circuitBreakers: circuitMetrics,
    checks: {
      eventBridge: circuitMetrics.find(m => m.name === 'eventbridge')?.isHealthy ?? true,
    },
  };


  const hasOpenCircuits = circuitMetrics.some(
    m => m.state === 'OPEN' && m.name === 'eventbridge'
  );

  if (hasOpenCircuits) {
    health.status = 'degraded';
  }

  return successResponse(200, health);
};