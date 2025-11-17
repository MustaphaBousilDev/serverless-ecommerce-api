import { Order, OrderStatus } from '../../domain/entities/Order';
import { OrderId } from '../../domain/value-objects/OrderId';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { EventPublisher } from '../../infrastructure/events/EventPublisher';
export interface UpdateOrderStatusInput {
  orderId: string;
  
  status: OrderStatus;
}

export interface UpdateOrderStatusOutput {
  orderId: string;
  status: string;
  updatedAt: string;
}

interface UserAuth {
  email: string;
  name?: string;
  sub: string;
}

export class UpdateOrderStatusUseCase {
    constructor(
      private orderRepository: IOrderRepository,
      private eventPublisher: EventPublisher = new EventPublisher()
    ) {}

    async execute(input: UpdateOrderStatusInput, user: UserAuth): Promise<UpdateOrderStatusOutput> {

    if (!input.orderId) {
      throw new Error('orderId is required');
    }

    if (!input.status) {
      throw new Error('status is required');
    }
    if(!Object.values(OrderStatus).includes(input.status)){
      throw new Error(`Invalid status: ${input.status}`);
    }


    const orderId = new OrderId(input.orderId);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order?.userId !== user.email) {
      throw  new Error('Forbidden - You can only access your own orders');
    }


    const oldStatus = order.status;

    if (oldStatus === input.status) {
      throw new Error(`Order is already in ${input.status} status`);
    }



    try {
      switch (input.status) {
        case OrderStatus.CONFIRMED:
          order.confirm();
          break;
        case OrderStatus.PROCESSING:
          order.process();
          break;
        case OrderStatus.SHIPPED:
          order.ship();
          break;
        case OrderStatus.DELIVERED:
          order.deliver()
          break;
        case OrderStatus.CANCELLED:
          order.cancel();
          break;
        default:
          throw new Error(`Cannot update to status: ${input.status}`);
      }
    } catch(error:any) {
      throw new Error(`Status update failed: ${error.message}`);
    }

    await this.orderRepository.update(order);

    try {
      await this.eventPublisher.publishOrderStatusChanged({
        orderId: order.orderId.value,
        userId: order.userId,
        oldStatus,
        newStatus: order.status,
        updatedAt: order.updatedAt.toISOString(),
        totalAmount: order.totalAmount,
      });
    } catch(error) {
      console.error('⚠️ Failed to publish OrderStatusChanged event:', error);
    }

    return {
      orderId: order.orderId.value,
      status: order.status,
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  
}