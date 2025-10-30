export abstract class AppError extends Error {
    public readonly statusCode: number
    public readonly isOperational: boolean

    constructor(
        message: string,
        statusCode: number,
        isOperational: boolean = true 
    ){ 
       super(message)
       this.statusCode = statusCode;
       this.isOperational = isOperational;

       // Maintains proper stack trace for where our error was thrown
       Error.captureStackTrace(this, this.constructor)

       // Set the prototype explicitly
       Object.setPrototypeOf(this, AppError.prototype);
    }

    
}