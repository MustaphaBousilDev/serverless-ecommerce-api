import { Order } from '../entities/Order';
import { OrderId } from '../value-objects/OrderId';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: OrderId): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  update(order: Order): Promise<void>;
  delete(orderId: OrderId): Promise<void>;
}