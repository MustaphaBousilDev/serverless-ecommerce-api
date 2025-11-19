// src/application/usecases/CreateOrderUseCase.ts

import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { Address } from '../../domain/value-objects/Address';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { EventPublisher } from '../../infrastructure/events/EventPublisher'
import { DynamoDBOrderHistoryRepository } from '../../infrastructure/repositories/DynamoDBOrderHistoryRepository';
import { OrderHistory } from '../../domain/value-objects/OrderHistory';
import { OrderValidator } from '../../interfaces/validators/OrderValidator';

export interface CreateOrderInput {
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface CreateOrderOutput {
  orderId: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private eventPublisher: EventPublisher  = new EventPublisher()
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    console.log("##============== INPUT", input)
  
    this.validateInput(input);

    //Create domain objects
    const orderItems = input.items.map(
      (item) =>
        new OrderItem({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })
    );

    const shippingAddress = new Address(input.shippingAddress);

    //Create order entity (business logic happens here)
    const order = Order.create(input.userId, orderItems, shippingAddress);


    await this.orderRepository.save(order);

    const orderHistoryRepo = new DynamoDBOrderHistoryRepository()
    const historyEntry = OrderHistory.create(
      order.orderId.value,
      order.status,
      input.userId,
      'CREATED'
    )
    await orderHistoryRepo.save(historyEntry);

    try {
      await this.eventPublisher.publishOrderCreated(order.toEventData());
    } catch(error) {
      console.error('⚠️ Failed to publish OrderCreated event, but order was created:', error)
    }

    return {
      orderId: order.orderId.value,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
    };
  }

  private validateInput(input: CreateOrderInput): void {
    if (!input.userId) {
      throw new Error('userId is required');
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('items are required');
    }

    if (!input.shippingAddress) {
      throw new Error('shippingAddress is required');
    }
    OrderValidator.validateItemCount(
      input.items.map(item => 
        new OrderItem({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })
      )
    );
    const calculatedTotal = input.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),0
    )
    OrderValidator.validateMinimumAmount(calculatedTotal);
    OrderValidator.validateMaximumAmount(calculatedTotal);
  }
}