import { v4 as uuidv4 } from 'uuid';

export enum ReservationStatus {
  RESERVED = 'RESERVED',
  CONFIRMED = 'CONFIRMED',
  RELEASED = 'RELEASED',
  EXPIRED = 'EXPIRED',
}

export class Reservation {
  constructor(
    public readonly reservationId: string,
    public readonly orderId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
    }>,
    public status: ReservationStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly expiresAt: Date
  ) {}

  static create(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
    expirationMinutes: number = 15
  ): Reservation {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000);

    return new Reservation(
      uuidv4(),
      orderId,
      items,
      ReservationStatus.RESERVED,
      now,
      now,
      expiresAt
    );
  }

  static fromObject(data: any): Reservation {
    return new Reservation(
      data.reservationId,
      data.orderId,
      data.items,
      data.status as ReservationStatus,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      new Date(data.expiresAt)
    );
  }

  confirm(): void {
    if (this.status !== ReservationStatus.RESERVED) {
      throw new Error(`Cannot confirm reservation with status ${this.status}`);
    }

    this.status = ReservationStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  release(): void {
    if (this.status === ReservationStatus.CONFIRMED) {
      throw new Error('Cannot release confirmed reservation');
    }

    this.status = ReservationStatus.RELEASED;
    this.updatedAt = new Date();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  expire(): void {
    this.status = ReservationStatus.EXPIRED;
    this.updatedAt = new Date();
  }

  toObject() {
    return {
      reservationId: this.reservationId,
      orderId: this.orderId,
      items: this.items,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
      isExpired: this.isExpired(),
    };
  }
}
