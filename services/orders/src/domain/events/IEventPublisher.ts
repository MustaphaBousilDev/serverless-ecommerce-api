import { OrderStatus } from "../value-objects/OrderStatus";

export interface IEventPublisher {
  publishOrderCreated(data: {
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
  }): Promise<void>;

  publishOrderCancelled(data: {
    orderId: string;
    userId: string;
    cancelledAt: string;
    reason: string;
    totalAmount: number;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  }): Promise<void>;

  publishOrderStatusChanged(data: {
    orderId: string;
    userId: string;
    oldStatus: OrderStatus;
    newStatus: OrderStatus;
    updatedAt: string;
    totalAmount: number;
  }): Promise<void>;
}