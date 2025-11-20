import { ErrorCode } from '../../domain/errors/ErrorCodes'
import { AppError } from '../../domain/errors/AppError'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: string;
    requestId: string;
    path: string;
    details?: Record<string, any>;
    stack?: string;
  };
}

export function handleError(
    error: Error | AppError,
    event: APIGatewayProxyEvent
): APIGatewayProxyResult{
    const requestId = event.requestContext?.requestId || 'unknown';
    const path = event.path;
    const isDevelopment = process.env.NODE_ENV === 'development';

    console.error('❌ Error occurred:', {
        error: error.message,
        stack: error.stack,
        requestId,
        path,
        timestamp: new Date().toISOString(),
    })
    // Handle known application errors
    if (error instanceof AppError) {
        const errorResponse: ErrorResponse = {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            timestamp: error.timestamp,
            requestId,
            path,
            details: error.details,
            ...(isDevelopment && { stack: error.stack }),
        },
        };

        return {
            statusCode: error.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Id': requestId,
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
            path,
            ...(isDevelopment && { stack: error.stack }),
        },
    }

    return {
        statusCode: 500,
        headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': requestId,
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