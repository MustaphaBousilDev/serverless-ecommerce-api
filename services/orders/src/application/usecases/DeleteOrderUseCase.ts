import { OrderId } from '../../domain/value-objects/OrderId';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { EventPublisher } from '../../infrastructure/events/EventPublisher';
export interface DeleteOrderInput {
  orderId: string;
}

export interface DeleteOrderOutput {
  orderId: string;
  deleted: boolean;
  message: string;
}

export class DeleteOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private eventPublisher: EventPublisher = new EventPublisher()
  ) {}

  async execute(input: DeleteOrderInput): Promise<DeleteOrderOutput> {
    if (!input.orderId) {
      throw new Error('orderId is required');
    }

    const orderId = new OrderId(input.orderId);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
      throw new Error(`Cannot delete order with status: ${order.status}`);
    }

    // Store userId for event
    const userId = order.userId;

    await this.orderRepository.delete(orderId);

    try {
      await this.eventPublisher.publishOrderDeleted(input.orderId, userId);
    } catch (error) {
      console.error('⚠️ Failed to publish OrderDeleted event:', error);
    }

    return {
      orderId: input.orderId,
      deleted: true,
      message: 'Order deleted successfully',
    };
  }
}