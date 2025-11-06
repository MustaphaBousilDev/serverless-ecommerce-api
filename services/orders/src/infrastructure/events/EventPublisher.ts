import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Order } from '../../domain/entities/Order';

export interface OrderEvent {
    source: string;
    detailType: string;
    detail: any;
}

export class EventPublisher {
    private client: EventBridgeClient
    private eventBusName: string

    constructor(){
        this.client = new EventBridgeClient({
            region: process.env.EVENT_BUS_NAME || 'dev-orders-event-bus'
        })
        this.eventBusName = process.env.EVENT_BUS_NAME || 'dev-orders-event-bus';
    }

    async publishOrderCreated(order: Order): Promise<void>{
       const event: OrderEvent = {
        source: 'orders.service',
        detailType: 'OrderCreated',
        detail: {
            orderId: order.orderId.value,
            userId: order.userId,
            status: order.status,
            totalAmount: order.totalAmount,
            items: order.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
            shippingAddress: {
                street: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                country: order.shippingAddress.country,
                zipCode: order.shippingAddress.zipCode,
            },
            createdAt: order.createdAt.toISOString(),
            timestamp: new Date().toISOString(),
        }
       }
       await this.publishEvent(event);
       console.log('✅ Published OrderCreated event:', order.orderId.value);
    }

    async publishOrderStatusChanged(order: Order, oldStatus: string): Promise<void> {
        const event: OrderEvent = {
            source: 'orders.service',
            detailType: 'OrderStatusChanged',
            detail: {
                orderId: order.orderId.value,
                userId: order.userId,
                oldStatus: oldStatus,
                newStatus: order.status,
                totalAmount: order.totalAmount,
                updatedAt: order.updatedAt.toISOString(),
                timestamp: new Date().toISOString(),
            },
        };
        await this.publishEvent(event);
        console.log('✅ Published OrderStatusChanged event:', order.orderId.value);
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
            const response = await this.client.send(command);
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