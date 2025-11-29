import { EventBridgeHandler } from 'aws-lambda';
import { DynamoDBInventoryRepository } from '../../infrastructure/repositories/DynamoDBInventoryRepository';
import { EventPublisher } from '../../infrastructure/events/EventPublisher';
import { ReleaseInventory } from '../../application/usecases/ReleaseInventory';
import { createLogger } from '../../shared/utils/logger';

export const handler: EventBridgeHandler<'PaymentFailed', any, void> = async (event) => {
  const correlationId = event.detail.correlationId || 'no-correlation-id';
  const logger = createLogger(correlationId);

  try {
    logger.info('PaymentFailed event received - starting compensation', {
      orderId: event.detail.orderId,
    });

    const repository = new DynamoDBInventoryRepository(correlationId);
    const eventPublisher = new EventPublisher(correlationId);
    const releaseInventory = new ReleaseInventory(repository, eventPublisher);

    // Release reserved inventory (compensation)
    await releaseInventory.execute({
      orderId: event.detail.orderId,
      reason: 'Payment failed',
      correlationId,
    });

    logger.info('Inventory released successfully (compensation)', {
      orderId: event.detail.orderId,
    });
  } catch (error: any) {
    logger.error('Failed to release inventory (compensation)', error, {
      orderId: event.detail.orderId,
    });

    throw error; // Will go to DLQ
  }
};