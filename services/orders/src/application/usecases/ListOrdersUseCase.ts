// src/application/usecases/ListOrdersUseCase.ts

import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

export interface ListOrdersInput {
  userId: string;
}

export interface OrderSummary {
  orderId: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface ListOrdersOutput {
  orders: OrderSummary[];
  count: number;
}

export class ListOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: ListOrdersInput): Promise<ListOrdersOutput> {
    // 1. Validate input
    if (!input.userId) {
      throw new Error('userId is required');
    }

    // 2. Get orders from repository
    const orders = await this.orderRepository.findByUserId(input.userId);

    // 3. Format output
    const orderSummaries = orders.map((order) => this.formatOrderSummary(order));

    return {
      orders: orderSummaries,
      count: orderSummaries.length,
    };
  }

  private formatOrderSummary(order: Order): OrderSummary {
    return {
      orderId: order.orderId.value,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
    };
  }
}