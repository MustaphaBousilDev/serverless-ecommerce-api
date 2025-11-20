// src/application/usecases/GetOrderUseCase.ts

import { Order } from '../../domain/entities/Order';
import { OrderId } from '../../domain/value-objects/OrderId';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { errorResponse } from '../../shared';
import { ForbiddenError } from '../../domain/errors/DomainErrors';

export interface GetOrderInput {
  orderId: string;
}

export interface UserAuth {
  email: string;
  name?: string;
  sub: string;
}

export interface GetOrderOutput {
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export class GetOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: GetOrderInput, user: UserAuth): Promise<GetOrderOutput> {
    // 1. Validate input
    if (!input.orderId) {
      throw new Error('orderId is required');
    }
    

    // 2. Get order from repository
    const orderId = new OrderId(input.orderId);
    const order = await this.orderRepository.findById(orderId);

    if (order?.userId !== user.email) {
      throw new ForbiddenError(
        'You do not have permission to access this order',
        { orderId: order?.userId, userId: user.email }
      );
    }

    // 3. Check if order exists
    if (!order) {
      throw new Error('Order not found');
    }

    // 4. Return formatted output
    return this.formatOutput(order);
  }

  private formatOutput(order: Order): GetOrderOutput {
    return {
      orderId: order.orderId.value,
      userId: order.userId,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.getTotalPrice(),
      })),
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        country: order.shippingAddress.country,
        zipCode: order.shippingAddress.zipCode,
      },
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}