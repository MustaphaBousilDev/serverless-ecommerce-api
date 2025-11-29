import { OrderId } from '../value-objects/OrderId';
import { OrderItem } from './OrderItem';
import { Address } from '../value-objects/Address';
import { OrderValidator } from '../../interfaces/validators/OrderValidator';
import {
  CannotCancelShippedOrderError,
  InvalidStatusTransitionError,
  CannotUpdateItemsError,
  ItemNotFoundInOrderError,
  CannotRemoveLastItemError
} from '../errors/DomainErrors'

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

  private canUpdateItems(): boolean {
    return this.props.status === OrderStatus.PENDING;
  }

  private recalculateTotal(): void {
    this.props.totalAmount = this.props.items.reduce(
      (sum, item) => sum + item.getTotalPrice(),
      0
    );
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
    OrderValidator.validateOrder(this.props.items, this.props.totalAmount);
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
    if (this.props.status === OrderStatus.SHIPPED || 
      this.props.status === OrderStatus.DELIVERED) {
      throw new CannotCancelShippedOrderError(
        this.props.orderId.value,
        this.props.status
      );
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

  deliver(): void {
    if (this.status !== OrderStatus.SHIPPED) {
      throw new Error('Order must be shipped before it can be delivered');
    }
    this.props.status = OrderStatus.DELIVERED;
    this.props.updatedAt = new Date();
  }

  addItem(item: OrderItem): void {
    if (!this.canUpdateItems()) {
      throw new CannotUpdateItemsError(
      this.props.orderId.value,
      this.props.status
    );
    }
    const existingItemIndex = this.props.items.findIndex(
      i => i.productId === item.productId
    )
    if(existingItemIndex >= 0){
      const existingItem = this.props.items[existingItemIndex]
      const newQuantity = existingItem.quantity + item.quantity
      this.props.items[existingItemIndex] = OrderItem.create(
        existingItem.productId,
        existingItem.productName,
        newQuantity,
        existingItem.unitPrice
      );

    } else {
      this.props.items.push(item);
    }
    this.recalculateTotal();
    this.props.updatedAt = new Date();
  }

  removeItem(productId: string): void {
    if(!this.canUpdateItems()){
      throw new CannotUpdateItemsError(
        this.props.orderId.value,
        this.props.status
      );
    }
    const initialLength = this.props.items.length
    this.props.items = this.props.items.filter(item => item.productId !== productId)
    if(this.props.items.length === initialLength){
      throw new ItemNotFoundInOrderError(
        this.props.orderId.value,
        productId
      );
    }
    if (this.props.items.length === 0) {
      throw new CannotRemoveLastItemError(this.props.orderId.value);
    }
    this.recalculateTotal();
    this.props.updatedAt = new Date();
  }

  updateItemQuantity(productId: string, newQuantity: number) : void {
    if (!this.canUpdateItems()) {
      throw new CannotUpdateItemsError(
        this.props.orderId.value,
        this.props.status
      );
    }
    if (newQuantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    const itemIndex = this.props.items.findIndex(i => i.productId === productId);
    if (itemIndex === -1) {
      throw new ItemNotFoundInOrderError(
        this.props.orderId.value,
        productId
      );
    }
    const item = this.props.items[itemIndex];
    this.props.items[itemIndex] = OrderItem.create(
      item.productId,
      item.productName,
      newQuantity,
      item.unitPrice
    );
    this.recalculateTotal();
    this.props.updatedAt = new Date();
  }

  process(): void {
    if (this.props.status !== OrderStatus.CONFIRMED) {
      throw new Error('Only confirmed orders can be processed');
    }
    this.props.status = OrderStatus.PROCESSING;
    this.props.updatedAt = new Date();  
  }
  // Convert to event data format
  toEventData(sagaId: string, sagaStep: number): {
  orderId: string;
  userId: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  sagaId: string;
  sagaStep: number;

} {
  return {
    orderId: this.props.orderId.value,
    userId: this.props.userId,
    totalAmount: this.props.totalAmount,
    items: this.props.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    shippingAddress: {
      street: this.props.shippingAddress.street,
      city: this.props.shippingAddress.city,
      state: this.props.shippingAddress.state,
      country: this.props.shippingAddress.country,
      zipCode: this.props.shippingAddress.zipCode,
    },
    sagaId: sagaId,
    sagaStep: sagaStep
  };
}

  // Getters
  get orderId(): OrderId {
    return this.props.orderId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get items(): OrderItem[] {
    return [...this.props.items]; 
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

  isPending(): boolean {
    return this.props.status === OrderStatus.PENDING;
  }

  isConfirmed(): boolean {
    return this.props.status === OrderStatus.CONFIRMED;
  }

  isShipped(): boolean {
    return this.props.status === OrderStatus.SHIPPED;
  }

  isCancelled(): boolean {
    return this.props.status === OrderStatus.CANCELLED;
  }

  isDelivered(): boolean {
    return this.props.status === OrderStatus.DELIVERED;
  }

  canBeCancelled(): boolean {
    return this.props.status === OrderStatus.PENDING || 
           this.props.status === OrderStatus.CONFIRMED;
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

  // Reconstruct from plain object (for database)
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