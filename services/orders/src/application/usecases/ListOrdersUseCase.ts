// src/application/usecases/ListOrdersUseCase.ts

import { Order, OrderStatus } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';


export interface ListOrdersFilters {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  lastEvaluatedKey?: string;
}

export interface ListOrdersInput {
  userId: string;
  filters: ListOrdersFilters;
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
  pagination: {
    limit: number;
    count: number;
    hasMore: boolean;
    nextCursor?: string;
  };
  filters: ListOrdersFilters;
  
}

export class ListOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: ListOrdersInput): Promise<ListOrdersOutput> {
    if (!request.userId) {
      throw new Error('userId is required');
    }

    const result = await this.orderRepository.findByUserIdWithFilters(
      request.userId,
      request.filters
    );
    let filteredOrders = result.orders;
    if (request.filters.fromDate) {
      const fromDate = new Date(request.filters.fromDate);
      filteredOrders = filteredOrders.filter(
        order => order.createdAt >= fromDate
      );
    }
    if (request.filters.toDate) {
      const toDate = new Date(request.filters.toDate);
      filteredOrders = filteredOrders.filter(
        order => order.createdAt <= toDate
      );
    }
    if (request.filters.minAmount !== undefined) {
      filteredOrders = filteredOrders.filter(
        order => order.totalAmount >= request.filters.minAmount!
      );
    }
    if (request.filters.maxAmount !== undefined) {
      filteredOrders = filteredOrders.filter(
        order => order.totalAmount <= request.filters.maxAmount!
      );
    }
    if (request.filters.sortBy === 'totalAmount') {
      filteredOrders.sort((a, b) => {
        const diff = a.totalAmount - b.totalAmount;
        return request.filters.sortOrder === 'asc' ? diff : -diff;
      });
    } else if (request.filters.sortBy === 'createdAt') {
      filteredOrders.sort((a, b) => {
        const diff = a.createdAt.getTime() - b.createdAt.getTime();
        return request.filters.sortOrder === 'asc' ? diff : -diff;
      });
    }
    const limit = request.filters.limit || 20;
    const hasMore = filteredOrders.length > limit;
    const orders = filteredOrders.slice(0, limit);

    // Generate next cursor 
    const nextCursor = hasMore && orders.length > 0
      ? Buffer.from(orders[orders.length - 1].orderId.value).toString('base64')
      : undefined;

    return {
      orders: orders.map(order => order.toObject()),
      pagination: {
        limit,
        count: orders.length,
        hasMore,
        nextCursor,
      },
      filters: request.filters,
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