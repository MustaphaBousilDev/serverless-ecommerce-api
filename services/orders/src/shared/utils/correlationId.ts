import { APIGatewayProxyEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

export function getCorrelationId(event: APIGatewayProxyEvent): string {
    const correlationId = 
      event.headers['X-Correlation-Id'] ||
      event.headers['x-correlation-id'] ||
      event.headers['X-Request-Id'] || 
      event.headers['x-request-id'] || 
      event.requestContext?.requestId || // API Gateway request ID
      uuidv4(); 

    return correlationId;
}


export function addCorrelationIdToHeaders(correlationId: string): Record<string, string> {
    return {
        'X-Correlation-Id': correlationId,
        'X-Request-Id': correlationId,
    };
}