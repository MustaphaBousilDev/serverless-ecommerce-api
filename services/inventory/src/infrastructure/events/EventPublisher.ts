import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { IEventPublisher } from '../../domain/events/IEventPublisher';
import { EVENT_BUS_NAME } from '../config/aws-config';

import { CircuitBreakerManager } from '../../shared/utils/circuitBreaker';
import { createLogger } from '../../shared/utils/logger';
import { withTimeout } from '../../shared/utils/timeout';
import { retry } from '../../shared/utils/retry';


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
    
    this.circuitBreaker = CircuitBreakerManager.getBreaker('eventbridge-inventory', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000,
      monitoringPeriod: 60000,
    });
  }

  async publishInventoryReserved(data: {
    reservationId: string;
    orderId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<void> {
    const event = {
      DetailType: 'InventoryReserved',
      Source: 'inventory.service',
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
                  this.logger.info('Publishing InventoryReserved event', { 
                    orderId: data.orderId,
                    reservationId: data.reservationId 
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
            'publishInventoryReserved',
            this.correlationId
          );
        },
        async () => {
          this.logger.warn('EventBridge unavailable, using fallback', {
            orderId: data.orderId,
            event: 'InventoryReserved',
          });
        }
      );

      this.logger.info('InventoryReserved event published', { 
        orderId: data.orderId,
        reservationId: data.reservationId 
      });
    } catch (error) {
      this.logger.error('Failed to publish InventoryReserved event', error, {
        orderId: data.orderId,
      });
    }
  }

  async publishInventoryReservationFailed(data: {
    orderId: string;
    reason: string;
  }): Promise<void> {
    const event = {
      DetailType: 'InventoryReservationFailed',
      Source: 'inventory.service',
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
                  this.logger.info('Publishing InventoryReservationFailed event', { 
                    orderId: data.orderId 
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
            'publishInventoryReservationFailed',
            this.correlationId
          );
        },
        async () => {
          this.logger.warn('EventBridge unavailable', { orderId: data.orderId });
        }
      );

      this.logger.info('InventoryReservationFailed event published', { 
        orderId: data.orderId 
      });
    } catch (error) {
      this.logger.error('Failed to publish InventoryReservationFailed event', error, {
        orderId: data.orderId,
      });
    }
  }

  async publishInventoryReleased(data: {
    reservationId: string;
    orderId: string;
    reason: string;
  }): Promise<void> {
    const event = {
      DetailType: 'InventoryReleased',
      Source: 'inventory.service',
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
                  this.logger.info('Publishing InventoryReleased event', { 
                    orderId: data.orderId,
                    reservationId: data.reservationId 
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
            'publishInventoryReleased',
            this.correlationId
          );
        },
        async () => {
          this.logger.warn('EventBridge unavailable', { orderId: data.orderId });
        }
      );

      this.logger.info('InventoryReleased event published', { 
        orderId: data.orderId,
        reservationId: data.reservationId 
      });
    } catch (error) {
      this.logger.error('Failed to publish InventoryReleased event', error, {
        orderId: data.orderId,
      });
    }
  }
}