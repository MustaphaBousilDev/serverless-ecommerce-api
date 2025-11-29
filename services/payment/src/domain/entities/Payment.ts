import { v4 as uuidv4 } from 'uuid';

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CHARGED = 'CHARGED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class Payment {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string,
    public status: PaymentStatus,
    public transactionId: string | null,
    public failureReason: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(orderId: string, amount: number, currency: string = 'USD'): Payment {
    return new Payment(
      uuidv4(),
      orderId,
      amount,
      currency,
      PaymentStatus.PENDING,
      null,
      null,
      new Date(),
      new Date()
    );
  }

  static fromObject(data: any): Payment {
    return new Payment(
      data.paymentId,
      data.orderId,
      data.amount,
      data.currency,
      data.status as PaymentStatus,
      data.transactionId,
      data.failureReason,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  charge(transactionId: string): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot charge payment with status ${this.status}`);
    }

    this.status = PaymentStatus.CHARGED;
    this.transactionId = transactionId;
    this.updatedAt = new Date();
  }

  fail(reason: string): void {
    this.status = PaymentStatus.FAILED;
    this.failureReason = reason;
    this.updatedAt = new Date();
  }

  refund(): void {
    if (this.status !== PaymentStatus.CHARGED) {
      throw new Error(`Cannot refund payment with status ${this.status}`);
    }

    this.status = PaymentStatus.REFUNDED;
    this.updatedAt = new Date();
  }

  toObject() {
    return {
      paymentId: this.paymentId,
      orderId: this.orderId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      transactionId: this.transactionId,
      failureReason: this.failureReason,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
