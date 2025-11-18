import { OrderHistory } from '../value-objects/OrderHistory';

export interface IOrderHistoryRepository {
  save(history: OrderHistory): Promise<void>;
  findByOrderId(orderId: string): Promise<OrderHistory[]>;
}