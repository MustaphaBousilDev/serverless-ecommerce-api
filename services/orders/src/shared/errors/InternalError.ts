import { AppError } from './AppError';

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error', isOperational: boolean = false) {
    super(message, 500, isOperational);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}