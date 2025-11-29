import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocumentClient } from '../config/dynamodb';
import { TABLE_NAMES } from '../config/aws-config';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
import { OrderId } from '../../domain/value-objects/OrderId';
import { ListOrdersFilters } from '../../application/usecases/ListOrdersUseCase';
import { createLogger } from '../../shared/utils/logger';
import { retry } from '../../shared/utils/retry';
import { DatabaseError } from '../../../../inventory/src/domain/errors/DomainErrors';
export class DynamoDBOrderRepository implements IOrderRepository {
    private tableName: string;

    constructor() {
        this.tableName = TABLE_NAMES.ORDERS
    }

    async save(order: Order,correlationId?: string): Promise<void> {
        const logger = createLogger(correlationId || 'no-correlation-id');
        const item = this.toDynamoDBItem(order)
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
        })
        try {
            await retry(
                async ()=> {
                    logger.info('Saving order to DynamoDB', { orderId: order.orderId.value });
                    return await dynamoDBDocumentClient.send(command);
                },
                {
                    maxAttempts: 3,
                    baseDelay: 100,
                    jitter: true,
                },
                correlationId || 'no-correlation-id'
            )
            logger.info('Order saved successfully', { orderId: order.orderId.value });
        } catch(error) {
            logger.error('Failed to save order after retries', error, { 
                orderId: order.orderId.value 
            });
            throw new DatabaseError('Failed to save order', { orderId: order.orderId.value });
        }
    }

    async findById(orderId: OrderId,correlationId?: string): Promise<Order | null> {
        const logger = createLogger(correlationId || 'no-correlation-id');
        const command  = new GetCommand({
            TableName: this.tableName,
            Key: {
                orderId: orderId.value
            }
        })
        try {
            const response = await retry(
                async ()=> {
                    logger.info('Getting order from DynamoDB', { orderId: orderId.value });
                    return await dynamoDBDocumentClient.send(command);
                },
                {
                    maxAttempts: 3,
                    baseDelay: 100,
                    jitter: true,
                },
                correlationId || 'no-correlation-id'
            )
            if(!response.Item){
                logger.info('Order not found', { orderId: orderId.value });
                return null;
            }
            return Order.fromObject(response.Item)
        } catch(error) {
            logger.error('Failed to get order after retries', error, { 
                orderId: orderId.value 
            });
            throw new DatabaseError('Failed to get order', { orderId: orderId.value });
        }
    }

    async findByUserId(userId: string,correlationId?: string): Promise<Order[]> {
        const logger = createLogger(correlationId || 'no-correlation-id');
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
            const response = await retry(
                async ()=> {
                    logger.info('Getting orders List from DynamoDB', { userId: userId });
                    return await dynamoDBDocumentClient.send(command);
                },
                {
                    maxAttempts: 3,
                    baseDelay: 100,
                    jitter: true,
                },
                correlationId || 'no-correlation-id'
            )
            if (!response.Items || response.Items.length === 0) {
                return []
            }
            return response.Items.map((item) => Order.fromObject(item))
        } catch(error) {
            logger.error('Error querying orders from DynamoDB: ', error, { 
                userId: userId 
            });
            throw new DatabaseError('Failed to query orders', {userId: userId})
        }
    }

    async update(order: Order,correlationId?: string): Promise<void> {
        const logger = createLogger(correlationId || 'no-correlation-id');
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
            await retry(
                async ()=> {
                    logger.info('Updating Order in DynamoDB', { order: order });
                    await dynamoDBDocumentClient.send(command);
                },
                {
                    maxAttempts: 3,
                    baseDelay: 100,
                    jitter: true,
                },
                correlationId || 'no-correlation-id'
            )
        } catch(error) {
            logger.error('Error updating order in DynamoDB: ', error, { 
                order: order
            });
            throw new DatabaseError('Failed to update order', {order: order})
        }
    }

    async delete(orderId: OrderId,correlationId?: string): Promise<void> {
        const logger = createLogger(correlationId || 'no-correlation-id');
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                orderId: orderId.value
            }
        })
        try {
            await retry(
                async ()=> {
                    logger.info('Deleting Order in DynamoDB', { orderId: orderId });
                    await dynamoDBDocumentClient.send(command);
                },
                {
                    maxAttempts: 3,
                    baseDelay: 100,
                    jitter: true,
                },
                correlationId || 'no-correlation-id'
            )
        } catch(error) {
            logger.error('Error Deleting order from DynamoDB: ', error, { 
                orderId: orderId
            });
            throw new DatabaseError('Failed to Deleting order', {orderId: orderId})
        }
    }

    async findByUserIdWithFilters(userId: string, filters: ListOrdersFilters): Promise<{ orders: Order[]; lastEvaluatedKey?: string; }> {
        const params : any = {
            TableName: this.tableName,
            IndexName: 'UserOrdersIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            ScanIndexForward: filters.sortOrder === 'asc',
            Limit: filters.limit || 20,
        }
        if(filters.status){
            params.FilterExpression = '#status = :status'
            params.ExpressionAttributeNames = {
                '#status': 'status',
            };
            params.ExpressionAttributeValues[':status'] = filters.status;
        }
        if (filters.lastEvaluatedKey) {
            try {
                params.ExclusiveStartKey = JSON.parse(
                    Buffer.from(filters.lastEvaluatedKey, 'base64').toString()
                );
            } catch (error) {
                console.error('Invalid cursor:', error);
            }
        }
        const command = new QueryCommand(params);
        try {
            const response = await dynamoDBDocumentClient.send(command);
            const orders = response.Items
                ? response.Items.map((item) => Order.fromObject(item))
                : [];
            const lastEvaluatedKey = response.LastEvaluatedKey
                ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
                : undefined;
            return { orders, lastEvaluatedKey };
        } catch(error) {
            console.error('Error querying orders from DynamoDB:', error);
            throw new Error('Failed to query orders');
        }
    }


    private toDynamoDBItem(order: Order): any {
        return order.toObject();
    }


}