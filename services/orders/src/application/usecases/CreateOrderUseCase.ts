// src/application/usecases/CreateOrderUseCase.ts

import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { Address } from '../../domain/value-objects/Address';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

export interface CreateOrderInput {
  userId: string;
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
}

export interface CreateOrderOutput {
  orderId: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export class CreateOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    // 1. Validate input
    this.validateInput(input);

    // 2. Create domain objects
    const orderItems = input.items.map(
      (item) =>
        new OrderItem({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })
    );

    const shippingAddress = new Address(input.shippingAddress);

    // 3. Create order entity (business logic happens here)
    const order = Order.create(input.userId, orderItems, shippingAddress);

    // 4. Persist order
    await this.orderRepository.save(order);

    // 5. Return output
    return {
      orderId: order.orderId.value,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
    };
  }

  private validateInput(input: CreateOrderInput): void {
    if (!input.userId) {
      throw new Error('userId is required');
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('items are required');
    }

    if (!input.shippingAddress) {
      throw new Error('shippingAddress is required');
    }
  }
}