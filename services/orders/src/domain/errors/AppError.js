"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const ErrorCodes_1 = require("./ErrorCodes");
class AppError extends Error {
    constructor(code, message, details, isOperational = true) {
        super(message);
        this.code = code;
        this.statusCode = (0, ErrorCodes_1.getHttpStatusForErrorCode)(code);
        this.details = details;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
        //Set the prototype explicitly
        Object.setPrototypeOf(this, AppError.prototype);
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            details: this.details
        };
    }
}
exports.AppError = AppError;
