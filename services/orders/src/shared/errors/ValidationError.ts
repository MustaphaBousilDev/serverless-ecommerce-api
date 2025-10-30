import { AppError } from './AppError';

export class ValidationError extends AppError {
  public readonly validationErrors: string[];

  constructor(message: string = 'Validation failed', validationErrors: string[] = []) {
    super(message, 400);
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

