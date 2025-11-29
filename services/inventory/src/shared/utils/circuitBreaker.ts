import { createLogger } from './logger';

export enum CircuitState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
    // Open after this many failures
    failureThreshold?: number
    // Close after this many successes
    successThreshold?: number;
    // Time to wait before trying again (ms)
    timeout?: number;
    // Reset failure count after this period (ms)
    monitoringPeriod?: number;
    // Circuit breaker name for logging
    name?: string;
}


interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
}


const DEFAULT_OPTIONS: Required<CircuitBreakerOptions> = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 60 seconds
  monitoringPeriod: 120000, // 2 minutes
  name: 'default',
};

/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping calls to failing services
 */

export class CircuitBreaker {
    private options: Required<CircuitBreakerOptions>
    private state: CircuitBreakerState
    private logger: any;

    constructor(options: CircuitBreakerOptions = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.state = {
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
        };
        this.logger = createLogger('circuit-breaker');
    }

    /**
     * Execute operation with circuit breaker protection
     */
    async execute<T>(
        operation: () => Promise<T>,
        fallback?: () => Promise<T> | T
    ): Promise<T> {
        // Check if circuit is open
        if (this.state.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.logger.info('Circuit transitioning to HALF_OPEN', {
                name: this.options.name,
                previousState: CircuitState.OPEN,
                });
                this.state.state = CircuitState.HALF_OPEN;
            } else {
                this.logger.warn('Circuit is OPEN, using fallback', {
                    name: this.options.name,
                    nextAttemptTime: this.state.nextAttemptTime,
                });
                return this.executeFallback(fallback);
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            // @ts-ignore
            if (this.state.state === CircuitState.OPEN) {
                this.logger.warn('Circuit opened, using fallback', {
                    name: this.options.name,
                });
                return this.executeFallback(fallback);
            }
            
            throw error;
        }
  }


    /**
     * Handle successful operation
     */
    private onSuccess(): void {
        this.state.failureCount = 0;

        if (this.state.state === CircuitState.HALF_OPEN) {
            this.state.successCount++;
            
            this.logger.info('Success in HALF_OPEN state', {
                name: this.options.name,
                successCount: this.state.successCount,
                successThreshold: this.options.successThreshold,
            });

            if (this.state.successCount >= this.options.successThreshold) {
                this.logger.info('Circuit closing', {
                    name: this.options.name,
                    previousState: CircuitState.HALF_OPEN,
                });
                this.state.state = CircuitState.CLOSED;
                this.state.successCount = 0;
                this.state.lastFailureTime = null;
                this.state.nextAttemptTime = null;
            }
        }
    }

    /**
     * Handle failed operation
     */
    private onFailure(): void {
        this.state.failureCount++;
        this.state.lastFailureTime = Date.now();

        this.logger.warn('Operation failed', {
            name: this.options.name,
            failureCount: this.state.failureCount,
            failureThreshold: this.options.failureThreshold,
            currentState: this.state.state,
        });

        // Reset failure count after monitoring period
        if (
            this.state.lastFailureTime &&
            Date.now() - this.state.lastFailureTime > this.options.monitoringPeriod
            ) {
            this.logger.info('Resetting failure count after monitoring period', {
                name: this.options.name,
            });
            this.state.failureCount = 1;
        }

        // If in HALF_OPEN and fails, go back to OPEN
        if (this.state.state === CircuitState.HALF_OPEN) {
            this.logger.warn('Circuit reopening after failure in HALF_OPEN', {
                name: this.options.name,
            });
            
            this.state.state = CircuitState.OPEN;
            this.state.nextAttemptTime = Date.now() + this.options.timeout;
            this.state.successCount = 0;
            return;
        }

        // Open circuit if threshold exceeded
        if (this.state.failureCount >= this.options.failureThreshold) {
            this.logger.error('Circuit opening due to failures', {
                name: this.options.name,
                failureCount: this.state.failureCount,
                failureThreshold: this.options.failureThreshold,
            });
            
            this.state.state = CircuitState.OPEN;
            this.state.nextAttemptTime = Date.now() + this.options.timeout;
            this.state.successCount = 0;
        }

        
  }



    /**
     * Check if we should attempt to reset the circuit
     */
    private shouldAttemptReset(): boolean {
        if (this.state.nextAttemptTime === null) {
            return false;
        }
        return Date.now() >= this.state.nextAttemptTime;
    }


    /**
     * Execute fallback logic
     */
    private async executeFallback<T>(
        fallback?: () => Promise<T> | T
    ): Promise<T>{
        if (fallback) {
            this.logger.info('Executing fallback', {
                name: this.options.name,
            });
            return await fallback();
        }

        throw new Error(
            `Circuit breaker is OPEN for ${this.options.name}. Service unavailable.`
        );
    }

    /**
     * Get current circuit state
     */
    getState(): CircuitBreakerState {
        return { ...this.state }
    }

    /**
     * Manually reset circuit breaker
     */
    reset(): void {
        this.logger.info('Manually resetting circuit breaker', {
            name: this.options.name,
        })

        this.state = {
            state: CircuitState.CLOSED,
            failureCount: 0,
            successCount: 0,
            lastFailureTime: null,
            nextAttemptTime: null
        }
    }

    /**
     * Get circuit health metrics
     */
    getMetrics(){
        return {
            name: this.options.name,
            state: this.state.state,
            failureCount: this.state.failureCount,
            successCount: this.state.successCount,
            lastFailureTime: this.state.lastFailureTime,
            nextAttemptTime: this.state.nextAttemptTime,
            isHealthy: this.state.state === CircuitState.CLOSED,
        }
    }
}

/**
 * Circuit Breaker Manager - Manages multiple circuit breakers
 */

export class CircuitBreakerManager {
  private static breakers: Map<string, CircuitBreaker> = new Map();

  static getBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(
        name,
        new CircuitBreaker({ ...options, name })
      );
    }
    return this.breakers.get(name)!;
  }

  static getAllMetrics() {
    const metrics: any[] = [];
    this.breakers.forEach((breaker) => {
      metrics.push(breaker.getMetrics());
    });
    return metrics;
  }

  static resetAll() {
    this.breakers.forEach((breaker) => breaker.reset());
  }
}