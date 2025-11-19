import { ListOrdersFilters } from '../../application/usecases/ListOrdersUseCase';
import { Order } from '../entities/Order';
import { OrderId, UserId } from '../value-objects/OrderId';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: OrderId): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  update(order: Order): Promise<void>;
  delete(orderId: OrderId): Promise<void>;
  findByUserIdWithFilters(userId: string, filters: ListOrdersFilters): Promise<{
    orders: Order[]; lastEvaluatedKey?: string
  }>
}