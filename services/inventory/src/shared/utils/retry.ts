import { createLogger } from "./logger";

export interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    exponentialBase?: number;
    jitter?: boolean;
    retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 100, // ms
  maxDelay: 5000, // ms
  exponentialBase: 2,
  jitter: true,
  retryableErrors: [
    'ProvisionedThroughputExceededException',
    'ThrottlingException',
    'RequestLimitExceeded',
    'ServiceUnavailable',
    'InternalServerError',
    'NetworkingError',
    'TimeoutError',
  ],
};

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    correlationId: string = 'no-correlation-id'
): Promise<T>{
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const logger = createLogger(correlationId);
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            logger.info('Attempting operation', { attempt, maxAttempts: opts.maxAttempts });
            const result = await operation()
            if (attempt > 1) {
                logger.info('Operation succeeded after retry', { attempt });
            }
            return result;
            
        } catch(error: any) {
            lastError = error;
            // Check if error is retryable
            const isRetryable = isRetryableError(error, opts.retryableErrors);
            logger.warn('Operation failed', {
                attempt,
                maxAttempts: opts.maxAttempts,
                errorName: error.name,
                errorMessage: error.message,
                isRetryable,
            });
            // If not retryable or last attempt, throw immediately
            if (!isRetryable || attempt === opts.maxAttempts) {
                logger.error('Operation failed permanently', error, {
                    attempt,
                    maxAttempts: opts.maxAttempts,
                });
                throw error;

            }
            // Calculate delay with exponential backoff
            const delay = calculateDelay(attempt, opts);
            logger.info('Retrying after delay', { 
                attempt, 
                nextAttempt: attempt + 1,
                delayMs: delay 
            });
            await sleep(delay);
        }
    }
    // Should never reach here, but TypeScript needs it
    throw lastError || new Error('Operation failed after all retries');
}

/**
 * Check if error should be retried
 */
function isRetryableError(error: any, retryableErrors: string[]): boolean {
    if (!error) return false;
    // Check error name
    if (error.name && retryableErrors.includes(error.name)) {
        return true;
    }
    // Check error code (AWS SDK v3)
    if (error.$metadata?.httpStatusCode) {
        const statusCode = error.$metadata.httpStatusCode;
        // Retry on 429 (throttle), 500, 502, 503, 504
        if ([429, 500, 502, 503, 504].includes(statusCode)) {
            return true;
        }
    }
    // Check error code (AWS SDK v2 style)
    if (error.code && retryableErrors.includes(error.code)) {
        return true;
    }
    return false;
}


/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
    // Exponential backoff: baseDelay * (exponentialBase ^ (attempt - 1))
    const exponentialDelay = options.baseDelay * Math.pow(options.exponentialBase, attempt - 1);
    // Cap at maxDelay
    let delay = Math.min(exponentialDelay, options.maxDelay);
    // Add jitter (randomness) to prevent thundering herd
    if (options.jitter) {
        // Random between 0 and delay
        delay = Math.random() * delay;
    }
    return Math.floor(delay);
}


function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function Retryable(options?: RetryOptions){
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ){
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            return retry(
                () => originalMethod.apply(this, args),
                options
            );
        };
        return descriptor;
    }
}
