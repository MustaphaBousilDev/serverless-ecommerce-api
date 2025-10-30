import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { AWS_CONFIG, QUEUE_URLS } from '../config/aws-config';

export class SQSService {
    private client: SQSClient;

    constructor(){
        this.client = new SQSClient({ region: AWS_CONFIG.region })
    }

    async sendMessage(queueUrl: string, messageBody: any): Promise<void>{
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(messageBody),
        })
        try {
            await this.client.send(command);
            console.log('Message sent to SQS');
        } catch(error) {
            console.error('Error sending message to SQS:', error);
            throw new Error('Failed to send message to SQS');
        }
    }

    async sendOrderForProcessing(order: any): Promise<void> {
        await this.sendMessage(QUEUE_URLS.ORDER_PROCESSING, order);
    }
}