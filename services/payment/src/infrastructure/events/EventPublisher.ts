import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { IEventPublisher } from '../../domain/events/IEventPublisher';
import { EVENT_BUS_NAME } from '../config/aws-config';
import { createLogger } from '../../utils/logger';
import { retry } from '../../utils/retry';
import { CircuitBreakerManager } from '../../utils/circuitBreaker';
import { withTimeout } from '../../utils/timeout';

export class EventPublisher implements IEventPublisher {
  private eventBridgeClient: EventBridgeClient;
  private eventBusName: string;
  private correlationId: string;
  private logger: any;
  private circuitBreaker: any;

  constructor(correlationId?: string) {
    this.eventBridgeClient = new EventBridgeClient({ region: process.env.AWS_REGION });
    this.eventBusName = EVENT_BUS_NAME;
    this.correlationId = correlationId || 'no-correlation-id';
    this.logger = createLogger(this.correlationId);
    
    this.circuitBreaker = CircuitBreakerManager.getBreaker('eventbridge-payment', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000,
      monitoringPeriod: 60000,
    });
  }

  async publishPaymentCharged(data: {
    paymentId: string;
    orderId: string;
    amount: number;
    transactionId: string;
  }): Promise<void> {
    const event = {
      DetailType: 'PaymentCharged',
      Source: 'payment.service',
      Detail: JSON.stringify({
        ...data,
        correlationId: this.correlationId,
        timestamp: new Date().toISOString(),
      }),
      EventBusName: this.eventBusName,
    };

    try {
      await this.circuitBreaker.execute(
        async () => {
          await withTimeout(
            async () => {
              await retry(
                async () => {
                  this.logger.info('Publishing PaymentCharged event', { 
                    orderId: data.orderId,
                    paymentId: data.paymentId 
                  });
                  return await this.eventBridgeClient.send(
                    new PutEventsCommand({ Entries: [event] })
                  );
                },
                { maxAttempts: 3, baseDelay: 200, maxDelay: 2000, jitter: true },
                this.correlationId
              );
            },
            5000,
            'publishPaymentCharged',
            this.correlationId
          );
        },
        async () => {
          this.logger.warn('EventBridge unavailable', { orderId: data.orderId });
        }
      );

      this.logger.info('PaymentCharged event published', { orderId: data.orderId });
    } catch (error) {
      this.logger.error('Failed to publish PaymentCharged event', error, {
        orderId: data.orderId,
      });
    }
  }

  async publishPaymentFailed(data: {
    orderId: string;
    reason: string;
  }): Promise<void> {
    const event = {
      DetailType: 'PaymentFailed',
      Source: 'payment.service',
      Detail: JSON.stringify({
        ...data,
        correlationId: this.correlationId,
        timestamp: new Date().toISOString(),
      }),
      EventBusName: this.eventBusName,
    };

    try {
      await this.circuitBreaker.execute(
        async () => {
          await withTimeout(
            async () => {
              await retry(
                async () => {
                  this.logger.info('Publishing PaymentFailed event', { orderId: data.orderId });
                  return await this.eventBridgeClient.send(
                    new PutEventsCommand({ Entries: [event] })
                  );
                },
                { maxAttempts: 3, baseDelay: 200, maxDelay: 2000, jitter: true },
                this.correlationId
              );
            },
            5000,
            'publishPaymentFailed',
            this.correlationId
          );
        },
        async () => {
          this.logger.warn('EventBridge unavailable', { orderId: data.orderId });
        }
      );

      this.logger.info('PaymentFailed event published', { orderId: data.orderId });
    } catch (error) {
      this.logger.error('Failed to publish PaymentFailed event', error, {
        orderId: data.orderId,
      });
    }
  }
}