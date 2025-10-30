import { v4 as uuidv4 } from 'uuid';

export class OrderId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('OrderId cannot be empty');
    }
    this._value = value;
  }

  static generate(): OrderId {
    return new OrderId(uuidv4());
  }

  get value(): string {
    return this._value;
  }

  equals(other: OrderId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}