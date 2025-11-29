import { EventBridgeHandler } from 'aws-lambda';
import { DynamoDBInventoryRepository } from '../../infrastructure/repositories/DynamoDBInventoryRepository';
import { EventPublisher } from '../../infrastructure/events/EventPublisher';
import { ReserveInventory } from '../../application/usecases/ReserveInventory';
import { createLogger } from '../../shared/utils/logger';


export const handler: EventBridgeHandler<'OrderCreated', any, void> = async (event) => {
  const correlationId = event.detail.correlationId || 'no-correlation-id';
  const logger = createLogger(correlationId);

  try {
    logger.info('OrderCreated event received', {
      orderId: event.detail.orderId,
      sagaId: event.detail.sagaId,
    });

    const repository = new DynamoDBInventoryRepository(correlationId);
    const eventPublisher = new EventPublisher(correlationId);
    const reserveInventory = new ReserveInventory(repository, eventPublisher);

    const items = event.detail.items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    await reserveInventory.execute({
      orderId: event.detail.orderId,
      items,
      correlationId,
    });

    logger.info('Inventory reserved successfully', {
      orderId: event.detail.orderId,
    });
  } catch (error: any) {
    logger.error('Failed to reserve inventory', error, {
      orderId: event.detail.orderId,
    });

    const eventPublisher = new EventPublisher(correlationId);
    await eventPublisher.publishInventoryReservationFailed({
      orderId: event.detail.orderId,
      reason: error.message,
    });

    throw error; // Will go to DLQ for retry
  }
};