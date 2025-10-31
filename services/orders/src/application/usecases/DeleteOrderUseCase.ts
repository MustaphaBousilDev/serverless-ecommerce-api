import { OrderId } from '../../domain/value-objects/OrderId';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

export interface DeleteOrderInput {
  orderId: string;
}

export interface DeleteOrderOutput {
  orderId: string;
  deleted: boolean;
  message: string;
}

export class DeleteOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: DeleteOrderInput): Promise<DeleteOrderOutput> {
    // 1. Validate input
    if (!input.orderId) {
      throw new Error('orderId is required');
    }

    // 2. Check if order exists
    const orderId = new OrderId(input.orderId);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // 3. Business rule: Can only delete PENDING or CANCELLED orders
    if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
      throw new Error(`Cannot delete order with status: ${order.status}`);
    }

    // 4. Delete order
    await this.orderRepository.delete(orderId);

    // 5. Return output
    return {
      orderId: input.orderId,
      deleted: true,
      message: 'Order deleted successfully',
    };
  }
}