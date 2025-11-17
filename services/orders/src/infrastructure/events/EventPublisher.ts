import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Order, OrderStatus } from '../../domain/entities/Order';

export interface OrderEvent {
    source: string;
    detailType: string;
    detail: any;
}

export class EventPublisher {
    private eventBridgeClient: EventBridgeClient
    private eventBusName: string

    constructor(){
        this.eventBridgeClient = new EventBridgeClient({
            region: process.env.AWS_REGION || 'us-east-1'
        })
        this.eventBusName = process.env.EVENT_BUS_NAME || 'dev-orders-event-bus';
        console.log('##-- EventPublisher initialized:', {
            region: process.env.AWS_REGION || 'us-east-1',
            eventBusName: this.eventBusName
        });
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
        Detail: JSON.stringify(data),
        EventBusName: this.eventBusName,
        };

        try {
        await this.eventBridgeClient.send(new PutEventsCommand({
            Entries: [event],
        }));
        console.log('✅ OrderCreated event published:', data.orderId);
        } catch (error) {
        console.error('❌ Failed to publish OrderCreated event:', error);
        throw error;
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
        Detail: JSON.stringify(data),
        EventBusName: this.eventBusName,
        };

        try {
        await this.eventBridgeClient.send(new PutEventsCommand({
            Entries: [event],
        }));
        console.log('✅ OrderCancelled event published:', data.orderId);
        } catch (error) {
        console.error('❌ Failed to publish OrderCancelled event:', error);
        throw error;
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
        Detail: JSON.stringify(data),
        EventBusName: this.eventBusName,
        };

        try {
        await this.eventBridgeClient.send(new PutEventsCommand({
            Entries: [event],
        }));
        console.log(`✅ OrderStatusChanged event published: ${data.orderId} (${data.oldStatus} → ${data.newStatus})`);
        } catch (error) {
        console.error('❌ Failed to publish OrderStatusChanged event:', error);
        throw error;
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