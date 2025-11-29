import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocumentClient } from '../config/dynamodb';
import { TABLE_NAMES } from '../config/aws-config';

export interface IdempotencyRecord {
  idempotencyKey: string;
  response: any;
  createdAt: string;
  expiresAt: number;
}

export class IdempotencyService {
    private tableName: string;
    private ttlHours: number;

    constructor(ttlHours: number = 24){
       this.tableName = TABLE_NAMES.IDEMPOTENCY
       this.ttlHours = ttlHours
    }

    //Check if request with this idempotency key was already processed
    async getExistingResponse(idempotencyKey: string): Promise<any | null> {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                idempotencyKey,
            },
        });
        try {
            const response = await dynamoDBDocumentClient.send(command);
            if (response.Item) {
                console.log('✅ Idempotent request detected:', idempotencyKey);
                return response.Item.response;
            }
            return null;
        } catch(error) {
            console.error('❌ Error checking idempotency:', error);
            return null;
        }
    }

    //Store the response for this idempotency key
    async storeResponse(idempotencyKey: string, response: any): Promise<void> {
        const now = new Date();
        const expiresAt = Math.floor(now.getTime() / 1000) + (this.ttlHours * 60 * 60);
        const item: IdempotencyRecord = {
            idempotencyKey,
            response,
            createdAt: now.toISOString(),
            expiresAt,
        };
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
            ConditionExpression: 'attribute_not_exists(idempotencyKey)', // Don't overwrite
        });

        try {
            await dynamoDBDocumentClient.send(command);
            console.log('✅ Idempotency key stored:', idempotencyKey);
        } catch(error: any) {
            // If item already exists (race condition), that's okay
            if (error.name === 'ConditionalCheckFailedException') {
                console.log('Idempotency key already exists (race condition):', idempotencyKey);
                return;
            }
            console.error('❌ Error storing idempotency key:', error);
            // Don't fail the request if storage fails
        }
    }

    //Generating idempotency key from request
    static generateKey(userId: string, requestBody: string): string {
        const crypto = require('crypto')
        const hash = crypto.createHash('sha256').update(`${userId}:${requestBody}`).digest('hex');

        return hash;
    }
}