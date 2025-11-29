import { EventBridgeHandler } from 'aws-lambda';
import { DynamoDBPaymentRepository } from '../../infrastructure/repositories/DynamoDBPaymentRepository';
import { EventPublisher } from '../../infrastructure/events/EventPublisher';
import { MockStripeService } from '../../infrastructure/external/MockStripeService';
import { ChargePayment } from '../../application/usecases/ChargePayment';
import { createLogger } from '../../utils/logger';

export const handler: EventBridgeHandler<'InventoryReserved', any, void> = async (event) => {
  const correlationId = event.detail.correlationId || 'no-correlation-id';
  const logger = createLogger(correlationId);

  try {
    logger.info('InventoryReserved event received', {
      orderId: event.detail.orderId,
      reservationId: event.detail.reservationId,
    });

    const repository = new DynamoDBPaymentRepository(correlationId);
    const eventPublisher = new EventPublisher(correlationId);
    const stripeService = new MockStripeService(correlationId);
    const chargePayment = new ChargePayment(repository, eventPublisher, stripeService);

    // Charge payment
    await chargePayment.execute({
      orderId: event.detail.orderId,
      amount: event.detail.amount || 100, // You'll get this from order details
      currency: 'USD',
      correlationId,
    });

    logger.info('Payment charged successfully', {
      orderId: event.detail.orderId,
    });
  } catch (error: any) {
    logger.error('Failed to charge payment', error, {
      orderId: event.detail.orderId,
    });

    throw error; // Will go to DLQ
  }
};