import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { AWS_CONFIG, EVENT_BUS } from '../config/aws-config';

export class EventBridgeService {
    private client: EventBridgeClient;

    constructor(){
        this.client = new EventBridgeClient({
            region: AWS_CONFIG.region
        })
    }

    async publishEvent(detailType: string, detail: any): Promise<void> {
        const command = new PutEventsCommand({
            Entries: [
                {
                    Source: 'ecommerce.orders',
                    DetailType: detailType,
                    Detail: JSON.stringify(detail),
                    EventBusName: EVENT_BUS.NAME
                }
            ]
        })
        try {
            await this.client.send(command);
            console.log(`Event published: ${detailType}`);
        } catch(error) {
            console.error('Error publishing event to EventBridge: ', error)
            throw new Error('Failed to publish event')
        }
    }
}