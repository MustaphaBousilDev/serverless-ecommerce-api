import { Order, OrderStatus } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { OrderHistory } from "../../domain/value-objects/OrderHistory";
import { OrderId } from "../../domain/value-objects/OrderId";
import { EventPublisher } from "../../infrastructure/events/EventPublisher";
import { DynamoDBOrderHistoryRepository } from "../../infrastructure/repositories/DynamoDBOrderHistoryRepository";

export interface CancelOrderRequest {
  orderId: string;
  userId: string;
  reason?: string;
}

export class CancelOrder {
  constructor(
    private orderRepository: IOrderRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(request: CancelOrderRequest): Promise<Order> {
    const orderId = new OrderId(request.orderId);

    // Get order
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Verify ownership
    if (order.userId !== request.userId) {
      throw new Error('Order not found or access denied');
    }

    // Cancel the order (will throw if not allowed)
    order.cancel();

    // Save updated order
    const newOrder = await this.orderRepository.update(order);

    const orderHistoryRepo = new DynamoDBOrderHistoryRepository();
    const historyEntry = OrderHistory.create(
      order.orderId.value,
      OrderStatus.CANCELLED,
      request.userId,
      'CANCELLED',
      order.status,
      request.reason
    );
    await orderHistoryRepo.save(historyEntry);

    // Publish OrderCancelled event
    await this.eventPublisher.publishOrderCancelled({
      orderId: order.orderId.value,
      userId: order.userId,
      cancelledAt: new Date().toISOString(),
      reason: request.reason || 'Cancelled by user',
      totalAmount: order.totalAmount,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    return order;
  }
}