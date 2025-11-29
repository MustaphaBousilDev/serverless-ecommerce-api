import { ErrorCode, getHttpStatusForErrorCode} from './ErrorCodes'

export interface ErrorDetails {
  [key: string]: any;
}

export abstract class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly details?: ErrorDetails;
    public readonly isOperational: boolean;
    public readonly timestamp: string;

    constructor(
        code: ErrorCode,
        message: string, 
        details?: ErrorDetails,
        isOperational: boolean = true 
    ){
        super(message)
        this.code = code;
        this.statusCode = getHttpStatusForErrorCode(code);
        this.details = details;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor)
        //Set the prototype explicitly
        Object.setPrototypeOf(this, AppError.prototype);
    }

    toJSON(){
        return {
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            details: this.details
        }
    }


}