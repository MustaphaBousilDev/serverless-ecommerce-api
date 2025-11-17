import { Order } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { OrderId } from "../../domain/value-objects/OrderId";
import { EventPublisher } from "../../infrastructure/events/EventPublisher";

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
    await this.orderRepository.update(order);

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