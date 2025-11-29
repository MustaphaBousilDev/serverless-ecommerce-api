import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocumentClient } from '../config/dynamodb';
import { TABLE_NAMES } from '../config/aws-config';
import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';
import { Payment } from '../../domain/entities/Payment';
import { createLogger } from '../../utils/logger';
import { retry } from '../../utils/retry';

export class DynamoDBPaymentRepository implements IPaymentRepository {
  private tableName: string;
  private logger: any;

  constructor(correlationId?: string) {
    this.tableName = TABLE_NAMES.PAYMENTS;
    this.logger = createLogger(correlationId || 'no-correlation-id');
  }

  async save(payment: Payment): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: payment.toObject(),
    });

    try {
      await retry(
        async () => {
          this.logger.info('Saving payment', { paymentId: payment.paymentId });
          return await dynamoDBDocumentClient.send(command);
        },
        { maxAttempts: 3, baseDelay: 100, jitter: true }
      );

      this.logger.info('Payment saved', { paymentId: payment.paymentId });
    } catch (error) {
      this.logger.error('Failed to save payment', error, { paymentId: payment.paymentId });
      throw error;
    }
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'OrderIdIndex',
      KeyConditionExpression: 'orderId = :orderId',
      ExpressionAttributeValues: {
        ':orderId': orderId,
      },
      Limit: 1,
    });

    try {
      const response = await dynamoDBDocumentClient.send(command);

      if (!response.Items || response.Items.length === 0) {
        return null;
      }

      return Payment.fromObject(response.Items[0]);
    } catch (error) {
      this.logger.error('Failed to find payment by order ID', error, { orderId });
      throw error;
    }
  }

  async update(payment: Payment): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { paymentId: payment.paymentId },
      UpdateExpression: 'SET #status = :status, transactionId = :txnId, failureReason = :reason, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': payment.status,
        ':txnId': payment.transactionId,
        ':reason': payment.failureReason,
        ':updatedAt': payment.updatedAt.toISOString(),
      },
    });

    try {
      await retry(
        async () => {
          this.logger.info('Updating payment', { paymentId: payment.paymentId, status: payment.status });
          return await dynamoDBDocumentClient.send(command);
        },
        { maxAttempts: 3, baseDelay: 100, jitter: true }
      );

      this.logger.info('Payment updated', { paymentId: payment.paymentId, status: payment.status });
    } catch (error) {
      this.logger.error('Failed to update payment', error, { paymentId: payment.paymentId });
      throw error;
    }
  }
}