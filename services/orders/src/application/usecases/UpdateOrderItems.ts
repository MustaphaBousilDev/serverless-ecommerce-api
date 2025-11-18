// src/application/use-cases/UpdateOrderItems.ts

import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { OrderId } from '../../domain/value-objects/OrderId';
import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { DynamoDBOrderHistoryRepository } from '../../infrastructure/repositories/DynamoDBOrderHistoryRepository';
import { OrderHistory } from '../../domain/value-objects/OrderHistory';

export interface UpdateOrderItemsRequest {
  orderId: string;
  userId: string;
  action: 'add' | 'remove' | 'update';
  productId: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
}

export class UpdateOrderItems {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: UpdateOrderItemsRequest): Promise<Order> {
    const orderId = new OrderId(request.orderId);

    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== request.userId) {
      throw new Error('Order not found or access denied');
    }


    switch (request.action) {
      case 'add':
        if (!request.productName || !request.quantity || !request.unitPrice) {
          throw new Error('productName, quantity, and unitPrice are required for adding items');
        }
        const newItem = OrderItem.create(
          request.productId,
          request.productName,
          request.quantity,
          request.unitPrice
        );
        order.addItem(newItem);
        break;

      case 'remove':
        order.removeItem(request.productId);
        break;

      case 'update':
        if (!request.quantity) {
          throw new Error('quantity is required for updating items');
        }
        order.updateItemQuantity(request.productId, request.quantity);
        break;

      default:
        throw new Error(`Invalid action: ${request.action}`);
    }


    await this.orderRepository.update(order);
    
    const orderHistoryRepo = new DynamoDBOrderHistoryRepository();
    const historyEntry = OrderHistory.create(
      order.orderId.value,
      order.status,
      request.userId,
      'ITEMS_UPDATED',
      undefined,
      undefined,
      { action: request.action, productId: request.productId }
    );
    await orderHistoryRepo.save(historyEntry);

    return order;
  }
}