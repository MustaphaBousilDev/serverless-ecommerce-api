import { OrderId } from '../value-objects/OrderId';
import { OrderItem } from './OrderItem';
import { Address } from '../value-objects/Address';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderProps {
  orderId: OrderId;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private props: OrderProps;

  constructor(props: OrderProps) {
    this.props = props;
    this.validate();
  }

  // Factory method to create new order
  static create(
    userId: string,
    items: OrderItem[],
    shippingAddress: Address
  ): Order {
    const orderId = OrderId.generate();
    const totalAmount = items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
    const now = new Date();

    return new Order({
      orderId,
      userId,
      items,
      shippingAddress,
      status: OrderStatus.PENDING,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Business logic: Validate order
  private validate(): void {
    if (!this.props.userId) {
      throw new Error('User ID is required');
    }

    if (!this.props.items || this.props.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    if (this.props.totalAmount <= 0) {
      throw new Error('Total amount must be greater than zero');
    }
  }

  // Business logic: Confirm order
  confirm(): void {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be confirmed');
    }
    this.props.status = OrderStatus.CONFIRMED;
    this.props.updatedAt = new Date();
  }

  // Business logic: Cancel order
  cancel(): void {
    if (this.props.status === OrderStatus.DELIVERED) {
      throw new Error('Cannot cancel delivered orders');
    }
    if (this.props.status === OrderStatus.CANCELLED) {
      throw new Error('Order is already cancelled');
    }
    this.props.status = OrderStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  // Business logic: Ship order
  ship(): void {
    if (this.props.status !== OrderStatus.CONFIRMED && this.props.status !== OrderStatus.PROCESSING) {
      throw new Error('Only confirmed or processing orders can be shipped');
    }
    this.props.status = OrderStatus.SHIPPED;
    this.props.updatedAt = new Date();
  }

  // Getters
  get orderId(): OrderId {
    return this.props.orderId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get items(): OrderItem[] {
    return [...this.props.items]; // Return copy to prevent mutation
  }

  get shippingAddress(): Address {
    return this.props.shippingAddress;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Convert to plain object (for persistence)
  toObject(): any {
    return {
      orderId: this.props.orderId.value,
      userId: this.props.userId,
      items: this.props.items.map(item => item.toObject()),
      shippingAddress: this.props.shippingAddress.toObject(),
      status: this.props.status,
      totalAmount: this.props.totalAmount,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  // Reconstruct from plain object (from database)
  static fromObject(data: any): Order {
    return new Order({
      orderId: new OrderId(data.orderId),
      userId: data.userId,
      items: data.items.map((item: any) => OrderItem.fromObject(item)),
      shippingAddress: Address.fromObject(data.shippingAddress),
      status: data.status as OrderStatus,
      totalAmount: data.totalAmount,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }
}