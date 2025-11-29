import { createLogger } from "./logger";

export class TimeoutError extends Error {
    constructor(operatopn: string, timeoutMs: number){
       super(`Operation ${operatopn} timed out after ${timeoutMs}ms`)
       this.name = 'TimeoutError'
    }
}

/**
 * Execute operation with timeout
 */
export async function withTimeout<T>(
    operation: ()=> Promise<T>,
    timeoutMs: number,
    operationName: string = 'operation',
    correlationId?: string 
) : Promise<T>{
    const logger = createLogger(correlationId || 'no-correlation-id');
    return Promise.race([
        operation(),
        new Promise<T>((_, reject) => {
            setTimeout(() => {
                logger.error('Operation timed out', new Error('Timeout'), {
                    operation: operationName,
                    timeoutMs,
                });
                reject(new TimeoutError(operationName, timeoutMs));
            }, timeoutMs);
        })
    ]);
}

/**
 * Timeout decorator for methods
 */
export function Timeout(timeoutMs: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withTimeout(
        () => originalMethod.apply(this, args),
        timeoutMs,
        propertyKey
      );
    };

    return descriptor;
  };
}