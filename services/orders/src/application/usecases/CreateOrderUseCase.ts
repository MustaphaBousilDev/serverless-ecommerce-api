// src/application/usecases/CreateOrderUseCase.ts

import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { Address } from '../../domain/value-objects/Address';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { EventPublisher } from '../../infrastructure/events/EventPublisher'
import { DynamoDBOrderHistoryRepository } from '../../infrastructure/repositories/DynamoDBOrderHistoryRepository';
import { v4 as uuidv4 } from 'uuid';
import { OrderHistory } from '../../domain/value-objects/OrderHistory';
import { OrderValidator } from '../../interfaces/validators/OrderValidator';
import { SagaStateRepository, SagaStatus } from '../../infrastructure/repositories/SagaStateRepository';
import { SagaEventType } from '../../domain/events/SagaEvents';

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
  correlationId: string;
  totalAmount: number;
  createdAt: string;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,

    private eventPublisher: EventPublisher ,
    private sagaRepository: SagaStateRepository
  ) {}

  async execute(input: CreateOrderInput,correlationId: string): Promise<CreateOrderOutput> {
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
    const sagaId = uuidv4();
    await this.sagaRepository.createSaga({
      sagaId,
      orderId: order.orderId.value,
      status: SagaStatus.STARTED,
      currentStep: 1,
      totalSteps: 4, // Order creation → Email → (Future: Inventory → Payment)
      startedAt: new Date().toISOString(),
      events: [],
      componsationEvents: [],
    })


    await this.orderRepository.save(order);
    await this.sagaRepository.addSagaEvent(sagaId, order.orderId.value, {
      eventType: SagaEventType.ORDER_CREATED,
      stepNumber: 1,
      isCompensation: false,
      data: {
        orderId: order.orderId.value,
        userId: input.userId,
        totalAmount: order.totalAmount,
      },
    });
    await this.sagaRepository.updateSagaStatus(
      sagaId,
      order.orderId.value,
      SagaStatus.IN_PROGRESS,
      2
    );

    const orderHistoryRepo = new DynamoDBOrderHistoryRepository()
    const historyEntry = OrderHistory.create(
      order.orderId.value,
      order.status,
      input.userId,
      'CREATED'
    )
    await orderHistoryRepo.save(historyEntry);

    try {
      await this.eventPublisher.publishOrderCreated(order.toEventData(sagaId,2/* Sate Steps */));
    } catch(error) {
      console.error('⚠️ Failed to publish OrderCreated event, but order was created:', error)
    }

    return {
      orderId: order.orderId.value,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      correlationId: correlationId
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