"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../../../src/shared/errors");
describe('Error Classes', () => {
    describe('NotFoundError', () => {
        test('should create NotFoundError with default message', () => {
            const error = new errors_1.NotFoundError();
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(errors_1.AppError);
            expect(error.message).toBe('Resource not found');
            expect(error.statusCode).toBe(404);
            expect(error.isOperational).toBe(true);
        });
        test('should create NotFoundError with custom message', () => {
            const error = new errors_1.NotFoundError('Order not found');
            expect(error.message).toBe('Order not found');
            expect(error.statusCode).toBe(404);
        });
        test('should have proper stack trace', () => {
            const error = new errors_1.NotFoundError();
            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('NotFoundError');
        });
    });
    describe('ValidationError', () => {
        test('should create ValidationError with validation errors', () => {
            const validationErrors = ['Field1 is required', 'Field2 is invalid'];
            const error = new errors_1.ValidationError('Validation failed', validationErrors);
            expect(error).toBeInstanceOf(errors_1.AppError);
            expect(error.message).toBe('Validation failed');
            expect(error.statusCode).toBe(400);
            expect(error.validationErrors).toEqual(validationErrors);
        });
        test('should create ValidationError with default message', () => {
            const error = new errors_1.ValidationError();
            expect(error.message).toBe('Validation failed');
            expect(error.validationErrors).toEqual([]);
        });
        test('should store validation errors', () => {
            const errors = ['Error 1', 'Error 2', 'Error 3'];
            const error = new errors_1.ValidationError('Multiple errors', errors);
            expect(error.validationErrors).toHaveLength(3);
            expect(error.validationErrors).toContain('Error 1');
        });
    });
    describe('InternalError', () => {
        test('should create InternalError with default message', () => {
            const error = new errors_1.InternalError();
            expect(error).toBeInstanceOf(errors_1.AppError);
            expect(error.message).toBe('Internal server error');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(false);
        });
        test('should create InternalError with custom message', () => {
            const error = new errors_1.InternalError('Database connection failed');
            expect(error.message).toBe('Database connection failed');
            expect(error.statusCode).toBe(500);
        });
        test('should allow setting operational flag', () => {
            const error = new errors_1.InternalError('Known error', true);
            expect(error.isOperational).toBe(true);
        });
    });
    describe('AppError Base Class', () => {
        class CustomError extends errors_1.AppError {
            constructor(message) {
                super(message, 418, true);
            }
        }
        test('should allow extending AppError', () => {
            const error = new CustomError("I'm a teapot");
            expect(error).toBeInstanceOf(errors_1.AppError);
            expect(error).toBeInstanceOf(Error);
            expect(error.statusCode).toBe(418);
            expect(error.isOperational).toBe(true);
        });
        test('should maintain proper prototype chain', () => {
            const error = new errors_1.NotFoundError();
            expect(Object.getPrototypeOf(error)).toBe(errors_1.NotFoundError.prototype);
        });
    });
});
