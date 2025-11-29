export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  correlationId: string;
  requestId?: string;
  userId?: string;
  orderId?: string;
  [key: string]: any;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      correlationId: this.context.correlationId,
      ...data,
    };
    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, data?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, any>) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | any, data?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
      ...data,
    });
  }

  addContext(context: Partial<LogContext>) {
    this.context = { ...this.context, ...context };
  }
}

export function createLogger(correlationId: string, additionalContext?: Partial<LogContext>): Logger {
  return new Logger({
    correlationId,
    ...additionalContext,
  });
}