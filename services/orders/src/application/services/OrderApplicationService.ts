// src/application/services/OrderApplicationService.ts

import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { CreateOrderUseCase, CreateOrderInput, CreateOrderOutput } from '../usecases/CreateOrderUseCase';
import { GetOrderUseCase, GetOrderInput, GetOrderOutput, UserAuth } from '../usecases/GetOrderUseCase';
import { ListOrdersUseCase, ListOrdersInput, ListOrdersOutput } from '../usecases/ListOrdersUseCase';

/**
 * Application Service - Facade pattern
 * Provides a unified interface to all use cases
 */
export class OrderApplicationService {
  private createOrderUseCase: CreateOrderUseCase;
  private getOrderUseCase: GetOrderUseCase;
  private listOrdersUseCase: ListOrdersUseCase;

  constructor(orderRepository: IOrderRepository) {
    this.createOrderUseCase = new CreateOrderUseCase(orderRepository);
    this.getOrderUseCase = new GetOrderUseCase(orderRepository);
    this.listOrdersUseCase = new ListOrdersUseCase(orderRepository);
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderOutput> {
    return this.createOrderUseCase.execute(input);
  }

  async getOrder(input: GetOrderInput, user: UserAuth): Promise<GetOrderOutput> {
    return this.getOrderUseCase.execute(input,user);
  }

  async listOrders(input: ListOrdersInput): Promise<ListOrdersOutput> {
    return this.listOrdersUseCase.execute(input);
  }
}