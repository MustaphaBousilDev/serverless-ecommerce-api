import { ErrorCode } from '../../../../inventory/src/domain/errors/ErrorCodes'
import { AppError } from '../../../../inventory/src/domain/errors/AppError'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {createLogger } from './logger'
import { addCorrelationIdToHeaders, getCorrelationId } from './correlationId';
import { MetricsPublisher, MetricName } from './metrics';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: string;
    requestId: string;
    correlationId?: string;
    path: string;
    details?: Record<string, any>;
    stack?: string;
  };
}

export function handleError(
    error: Error | AppError,
    event: APIGatewayProxyEvent
): APIGatewayProxyResult{
    const correlationId = getCorrelationId(event);
    
    const requestId = event.requestContext?.requestId || 'unknown';
    const path = event.path;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const logger = createLogger(correlationId, { requestId, path });
    const metrics = new MetricsPublisher();
    logger.error('Request failed', error, {
        statusCode: error instanceof AppError ? error.statusCode : 500,
        code: error instanceof AppError ? error.code : 'INTERNAL_SERVER_ERROR',
    });
    // Handle known application errors
    if (error instanceof AppError) {
        if(error.code.includes('VALIDATION')){
            metrics.publishError(MetricName.VALIDATION_ERROR, error.code);
        } else if(error.code.includes('DATABASE')){
            metrics.publishError(MetricName.DATABASE_ERROR, error.code);
        }
        const errorResponse: ErrorResponse = {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            timestamp: error.timestamp,
            requestId,
            correlationId,
            path,
            details: error.details,
            ...(isDevelopment && { stack: error.stack }),
        },
        };

        return {
            statusCode: error.statusCode,
            headers: {
                'Content-Type': 'application/json',
                ...addCorrelationIdToHeaders(correlationId),
            },
            body: JSON.stringify(errorResponse),
        };
    }
    // Handle unknown errors (should not happen in production)
    const errorResponse: ErrorResponse = {
        success: false,
        error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: isDevelopment ? error.message : 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
            requestId,
            correlationId, 
            path,
            ...(isDevelopment && { stack: error.stack }),
        },
    }

    return {
        statusCode: 500,
        headers: {
            'Content-Type': 'application/json',
            ...addCorrelationIdToHeaders(correlationId),
        },
        body: JSON.stringify(errorResponse),
    }
}


export function withErrorHandling(
    handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
){
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
           return await handler(event)
        } catch(error) {
            return handleError(error as Error, event)
        }
    }
}