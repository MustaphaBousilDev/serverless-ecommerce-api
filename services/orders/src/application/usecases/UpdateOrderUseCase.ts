import { Order, OrderStatus } from '../../domain/entities/Order';
import { OrderId } from '../../domain/value-objects/OrderId';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

export interface UpdateOrderStatusOutput {
  orderId: string;
  status: string;
  updatedAt: string;
}

export class UpdateOrderStatusUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusOutput> {

    if (!input.orderId) {
      throw new Error('orderId is required');
    }

    if (!input.status) {
      throw new Error('status is required');
    }


    const orderId = new OrderId(input.orderId);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }


    switch (input.status) {
      case OrderStatus.CONFIRMED:
        order.confirm();
        break;
      case OrderStatus.SHIPPED:
        order.ship();
        break;
      case OrderStatus.CANCELLED:
        order.cancel();
        break;
      default:
        throw new Error(`Cannot update to status: ${input.status}`);
    }

    // 4. Save updated order
    await this.orderRepository.update(order);

    // 5. Return output
    return {
      orderId: order.orderId.value,
      status: order.status,
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}