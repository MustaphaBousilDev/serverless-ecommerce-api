import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocumentClient } from '../config/dynamodb';

import { TABLE_NAMES } from '../config/aws-config';
import { IOrderHistoryRepository } from '../../domain/repositories/IOrderHistoryRepository';
import { OrderHistory } from '../../domain/value-objects/OrderHistory';

export class DynamoDBOrderHistoryRepository implements IOrderHistoryRepository {
    private tableName: string;
    constructor() {
        this.tableName = TABLE_NAMES.ORDER_HISTORY || `${process.env.Environment || 'dev'}-order-history`;
    }

    async save(history: OrderHistory) : Promise<void>{
        const item = {
            orderId: history.orderId,
            timestamp: history.timestamp.toISOString(),
            oldStatus: history.oldStatus,
            newStatus: history.newStatus,
            changedBy: history.changedBy,
            changeType: history.changeType,
            reason: history.reason,
            metadata: history.metadata,
        }
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
        });
        try {
            await dynamoDBDocumentClient.send(command);
            console.log('✅ Order history saved:', history.orderId);
        } catch(error){
            console.error('❌ Error saving order history to DynamoDB:', error);
            throw new Error('Failed to save order history');
        }
    }

    async findByOrderId(orderId: string): Promise<OrderHistory[]>{
       const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'orderId = :orderId',
        ExpressionAttributeValues: {
            ':orderId': orderId,
        },
        ScanIndexForward: false, // Sort by timestamp descending
       })
       try {
            const response = await dynamoDBDocumentClient.send(command);
            if (!response.Items || response.Items.length === 0) {
                return [];
            }
            return response.Items.map((item) => OrderHistory.fromObject(item));
       } catch(error){
        console.error('❌ Error querying order history from DynamoDB:', error);
        throw new Error('Failed to query order history');
       }
    }
}