import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { createLogger } from '../../shared';
import { retry } from '../../shared/utils/retry';

export interface OrderEvent {
    source: string;
    detailType: string;
    detail: any;
}

export class EventPublisher {
    private eventBridgeClient: EventBridgeClient
    private eventBusName: string
    private correlationId: string;
    private logger: any;

    constructor(correlationId?: string){
        this.eventBridgeClient = new EventBridgeClient({
            region: process.env.AWS_REGION || 'us-east-1'
        })
        this.eventBusName = process.env.EVENT_BUS_NAME || 'dev-orders-event-bus';
        console.log('##-- EventPublisher initialized:', {
            region: process.env.AWS_REGION || 'us-east-1',
            eventBusName: this.eventBusName
        });
        this.correlationId = correlationId || 'no-correlation-id';
        this.logger = createLogger(this.correlationId);
    }

    async publishOrderCreated(data: {
    orderId: string;
    userId: string;
    totalAmount: number;
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
    }): Promise<void> {
        const event = {
        DetailType: 'OrderCreated',
        Source: 'orders.service',
        Detail: JSON.stringify({
            ...data,
            correlationId: this.correlationId,
            timestamp: new Date().toISOString(),
        }),
        EventBusName: this.eventBusName,
        };

        try {
            await retry(
                async ()=> {
                    this.logger.info('Publishing OrderCreated event', { orderId: data.orderId });
                    return await this.eventBridgeClient.send(new PutEventsCommand({
                        Entries: [event],
                    }))
                },
                {
                    maxAttempts: 3,
                    baseDelay: 200,
                    maxDelay: 2000,
                    jitter: true,
                },
                this.correlationId
            )
            this.logger.info('✅ OrderCreated event published', {
                orderId: data.orderId,
                eventBus: this.eventBusName,
            });
        } catch (error) {
            this.logger.error('Failed to publish OrderCreated event after retries', error, {
                orderId: data.orderId,
            });
            // Don't throw - event publishing shouldn't break order creation
            //throw error;
        }
    }

    async publishOrderCancelled(data: {
    orderId: string;
    userId: string;
    cancelledAt: string;
    reason: string;
    totalAmount: number;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
    }): Promise<void> {
        const event = {
        DetailType: 'OrderCancelled',
        Source: 'orders.service',
        Detail: JSON.stringify({
            ...data,
            correlationId: this.correlationId,
            timestamp: new Date().toISOString(),
        }),
        EventBusName: this.eventBusName,
        };

        try {
            await retry(
                async ()=> {
                    this.logger.info('Publishing OrderCancelled event', { orderId: data.orderId });
                    return await this.eventBridgeClient.send(new PutEventsCommand({
                        Entries: [event],
                    }));
                },
                {
                    maxAttempts: 3,
                    baseDelay: 200,
                    maxDelay: 2000,
                    jitter: true,
                },
                this.correlationId
            )
            
            this.logger.info('OrderCancelled event published', {
                orderId: data.orderId,
                reason: data.reason,
            });
        } catch (error) {
            this.logger.error('Failed to publish OrderCancelled event after retries', error, {
                orderId: data.orderId,
            });
            // Don't throw - event publishing shouldn't break order creation
            //throw error;
        }
    }

    async publishOrderStatusChanged(data: {
    orderId: string;
    userId: string;
    oldStatus: OrderStatus;
    newStatus: OrderStatus;
    updatedAt: string;
    totalAmount: number;
    }): Promise<void> {
        const event = {
        DetailType: 'OrderStatusChanged',
        Source: 'orders.service',
        Detail: JSON.stringify({
            ...data,
            correlationId: this.correlationId,
            timestamp: new Date().toISOString(),
        }),
        EventBusName: this.eventBusName,
        };

        try {
            await retry(
                async () => {
                   this.logger.info('Publishing OrderStatusChanged event', { orderId: data.orderId });
                    return await this.eventBridgeClient.send(new PutEventsCommand({
                        Entries: [event],
                    }));
                },
                {
                    maxAttempts: 3,
                    baseDelay: 200,
                    maxDelay: 2000,
                    jitter: true,
                },
                this.correlationId
            );
            this.logger.info('OrderStatusChanged event published', {
                orderId: data.orderId,
                oldStatus: data.oldStatus,
                newStatus: data.newStatus,
            });
        } catch (error) {
            this.logger.error('Failed to publish OrderStatusChanged event', error, {
                orderId: data.orderId,
            });
            // Don't throw - event publishing shouldn't break order creation
            //throw error;
        }
    }

    

    async publishOrderDeleted(orderId: string, userId: string): Promise<void> {
        const event: OrderEvent = {
        source: 'orders.service',
        detailType: 'OrderDeleted',
        detail: {
            orderId: orderId,
            userId: userId,
            timestamp: new Date().toISOString(),
        },
        };

        await this.publishEvent(event);
        console.log('✅ Published OrderDeleted event:', orderId);
    }

    private async publishEvent(event: OrderEvent): Promise<void> {
        try {
            const command = new PutEventsCommand({
                Entries: [
                    {
                        Source: event.source,
                        DetailType: event.detailType,
                        Detail: JSON.stringify(event.detail),
                        EventBusName: this.eventBusName,
                    },
                ],
            });
            const response = await this.eventBridgeClient.send(command);
            if (response.FailedEntryCount && response.FailedEntryCount > 0) {
                console.error('❌ Failed to publish event:', response.Entries);
                throw new Error('Failed to publish event to EventBridge');
            }
        } catch (error) {
            console.error('❌ Error publishing event:', error);
            throw error;
        }
    }
}