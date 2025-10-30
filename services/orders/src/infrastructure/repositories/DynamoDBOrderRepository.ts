import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocumentClient } from '../config/dynamodb';
import { TABLE_NAMES } from '../config/aws-config';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
import { OrderId } from '../../domain/value-objects/OrderId';

export class DynamoDBOrderRepository implements IOrderRepository {
    private tableName: string;

    constructor() {
        this.tableName = TABLE_NAMES.ORDERS
    }

    async save(order: Order): Promise<void> {
        const item = this.toDynamoDBItem(order)
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
        })
        try {
            await dynamoDBDocumentClient.send(command)
        } catch(error) {
            console.error('Error saving order to DynamoDB: ', error)
            throw new Error('Failed to save order')
        }
    }

    async findById(orderId: OrderId): Promise<Order | null> {
        const command  = new GetCommand({
            TableName: this.tableName,
            Key: {
                orderId: orderId.value
            }
        })
        try {
            const response = await dynamoDBDocumentClient.send(command)
            if(!response.Item){
                return null;
            }
            return Order.fromObject(response.Item)
        } catch(error) {
            console.error('Error getting order Item From DynamoDB: ', error)
            throw new Error('Failed to get order')
        }
    }

    async findByUserId(userId: string): Promise<Order[]> {
        const command = new QueryCommand({
            TableName: this.tableName,
            IndexName: 'UserOrdersIndex', // GSI name from CloudFormation
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false, // Sort Descending (newest first)
        })

        try {
            const response = await dynamoDBDocumentClient.send(command)
            if (!response.Items || response.Items.length === 0) {
                return []
            }
            return response.Items.map((item) => Order.fromObject(item))
        } catch(error) {
            console.error('Error querying orders from DynamoDB: ', error)
            throw new Error('Failed to query orders')
        }
    }

    async update(order: Order): Promise<void> {
        const item = this.toDynamoDBItem(order)
        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: {
                orderId: order.orderId.value,
            },
            UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt, #items = :items, #totalAmount = :totalAmount',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#items': 'items',
                '#totalAmount': 'totalAmount',
            },
            ExpressionAttributeValues: {
                ':status': item.status,
                ':updatedAt': item.updatedAt,
                ':items': item.items,
                ':totalAmount': item.totalAmount,
            }
        })
        try {
            await dynamoDBDocumentClient.send(command);
        } catch(error) {
            console.error('Error updating order in DynamoDB:', error);
            throw new Error('Failed to update order');
        }
    }

    async delete(orderId: OrderId): Promise<void> {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                orderId: orderId.value
            }
        })
        try {
            await dynamoDBDocumentClient.send(command);
        } catch(error) {
            console.error('Error Deleting order from DynamoDB:', error)
            throw new Error('Failed to delete order');
        }
    }


    private toDynamoDBItem(order: Order): any {
        return order.toObject();
    }
}