import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IOrderHistoryRepository } from '../../domain/repositories/IOrderHistoryRepository';
import { OrderId } from '../../domain/value-objects/OrderId';
import { OrderHistory } from '../../domain/value-objects/OrderHistory';

export interface GetOrderHistoryRequest {
  orderId: string;
  userId: string;
}

export interface GetOrderHistoryResponse {
  orderId: string;
  history: Array<{
    timestamp: string;
    oldStatus?: string;
    newStatus: string;
    changedBy: string;
    changeType: string;
    reason?: string;
    metadata?: Record<string, any>;
  }>;
}

export class GetOrderHistory {
    constructor(
    private orderRepository: IOrderRepository,
    private orderHistoryRepository: IOrderHistoryRepository
  ) {}

    async execute(request: GetOrderHistoryRequest): Promise<GetOrderHistoryResponse> {
        const orderId = new OrderId(request.orderId);

        const order = await this.orderRepository.findById(orderId);
        
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.userId !== request.userId) {
            throw new Error('Forbidden - You can only access your own orders');
        }

        const history = await this.orderHistoryRepository.findByOrderId(request.orderId);

        return {
            orderId: request.orderId,
            history: history.map(h => h.toObject()),
        };
    }
}

