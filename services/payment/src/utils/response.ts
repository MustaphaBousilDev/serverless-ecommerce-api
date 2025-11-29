import { APIGatewayProxyResult } from 'aws-lambda';
import { addCorrelationIdToHeaders } from './correlationId';
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: {
    code: string;
    details?: any;
  };
}

/**
 * Success Response (200)
 */
export const success = <T>(statusCode: number, data: T, message: string = 'Success'): APIGatewayProxyResult => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // CORS
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response),
  };
};

/**
 * Error Response
 */
export const error = (
  statusCode: number,
  message: string,
  errorDetails?: any,
  errorCode?: string
): APIGatewayProxyResult => {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode || `ERROR_${statusCode}`,
      details: errorDetails,
    },
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response),
  };
};

/**
 * 400 - Bad Request
 */
export const badRequest = (message: string = 'Bad Request', details?: any): APIGatewayProxyResult => {
  return error(400, message, details, 'BAD_REQUEST');
};

/**
 * 404 - Not Found
 */
export const notFound = (message: string = 'Resource not found'): APIGatewayProxyResult => {
  return error(404, message, null, 'NOT_FOUND');
};

/**
 * 500 - Internal Server Error
 */
export const internalError = (message: string = 'Internal server error', details?: any): APIGatewayProxyResult => {
  return error(500, message, details, 'INTERNAL_ERROR');
};

/**
 * 201 - Created
 */
export const created = <T>(data: T, message: string = 'Resource created successfully'): APIGatewayProxyResult => {
  return success(201, data, message);
};

/**
 * 200 - OK
 */
export const ok = <T>(data: T, message: string = 'Success'): APIGatewayProxyResult => {
  return success(200, data, message);
};

export const successResponse = (statusCode: number, data: any, correlationId?: string) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99',// Would calculate from usage
        'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString(),
        ...(correlationId && addCorrelationIdToHeaders(correlationId)),
    },
    body: JSON.stringify({
        success: true,
        data,
    })
})

export const errorResponse = (statusCode: number, message: string, error?: any,details?: any) => ({
    statusCode, 
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
        success: false,
        message,
        error: {
          message,
          details,
          timestamp: new Date().toISOString(),
        },
    })
})

