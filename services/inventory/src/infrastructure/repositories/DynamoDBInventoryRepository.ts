// src/infrastructure/repositories/DynamoDBInventoryRepository.ts

import { PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocumentClient } from '../config/dynamodb';
import { TABLE_NAMES } from '../config/aws-config';
import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';
import { InventoryItem } from '../../domain/entities/InventoryItem';
import { Reservation } from '../../domain/entities/Reservation';
import { createLogger } from '../../shared/utils/logger';
import { retry } from '../../shared/utils/retry';


export class DynamoDBInventoryRepository implements IInventoryRepository {
  private inventoryTableName: string;
  private reservationsTableName: string;
  private logger: any;

  constructor(correlationId?: string) {
    this.inventoryTableName = TABLE_NAMES.INVENTORY;
    this.reservationsTableName = TABLE_NAMES.RESERVATIONS;
    this.logger = createLogger(correlationId || 'no-correlation-id');
  }

  async findByProductId(productId: string): Promise<InventoryItem | null> {
    const command = new GetCommand({
      TableName: this.inventoryTableName,
      Key: { productId },
    });

    try {
      const response = await retry(
        async () => {
          this.logger.info('Getting inventory item', { productId });
          return await dynamoDBDocumentClient.send(command);
        },
        { maxAttempts: 3, baseDelay: 100, jitter: true }
      );

      if (!response.Item) {
        this.logger.info('Inventory item not found', { productId });
        return null;
      }

      return InventoryItem.fromObject(response.Item);
    } catch (error) {
      this.logger.error('Failed to get inventory item', error, { productId });
      throw error;
    }
  }

  async save(item: InventoryItem): Promise<void> {
    const command = new PutCommand({
      TableName: this.inventoryTableName,
      Item: item.toObject(),
    });

    try {
      await retry(
        async () => {
          this.logger.info('Saving inventory item', { productId: item.productId });
          return await dynamoDBDocumentClient.send(command);
        },
        { maxAttempts: 3, baseDelay: 100, jitter: true }
      );

      this.logger.info('Inventory item saved', { productId: item.productId });
    } catch (error) {
      this.logger.error('Failed to save inventory item', error, { productId: item.productId });
      throw error;
    }
  }

  async update(item: InventoryItem): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.inventoryTableName,
      Key: { productId: item.productId },
      UpdateExpression: 'SET availableQuantity = :available, reservedQuantity = :reserved, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':available': item.availableQuantity,
        ':reserved': item.reservedQuantity,
        ':updatedAt': item.updatedAt.toISOString(),
      },
    });

    try {
      await retry(
        async () => {
          this.logger.info('Updating inventory item', { productId: item.productId });
          return await dynamoDBDocumentClient.send(command);
        },
        { maxAttempts: 3, baseDelay: 100, jitter: true }
      );

      this.logger.info('Inventory item updated', { 
        productId: item.productId,
        available: item.availableQuantity,
        reserved: item.reservedQuantity 
      });
    } catch (error) {
      this.logger.error('Failed to update inventory item', error, { productId: item.productId });
      throw error;
    }
  }

  async createReservation(reservation: Reservation): Promise<void> {
    const command = new PutCommand({
      TableName: this.reservationsTableName,
      Item: {
        ...reservation.toObject(),
        reservationId: reservation.reservationId,
        orderId: reservation.orderId,
      },
    });

    try {
      await retry(
        async () => {
          this.logger.info('Creating reservation', { 
            reservationId: reservation.reservationId,
            orderId: reservation.orderId 
          });
          return await dynamoDBDocumentClient.send(command);
        },
        { maxAttempts: 3, baseDelay: 100, jitter: true }
      );

      this.logger.info('Reservation created', { reservationId: reservation.reservationId });
    } catch (error) {
      this.logger.error('Failed to create reservation', error, { 
        reservationId: reservation.reservationId 
      });
      throw error;
    }
  }

  async getReservation(reservationId: string): Promise<Reservation | null> {
    const command = new GetCommand({
      TableName: this.reservationsTableName,
      Key: { reservationId },
    });

    try {
      const response = await dynamoDBDocumentClient.send(command);

      if (!response.Item) {
        return null;
      }

      return Reservation.fromObject(response.Item);
    } catch (error) {
      this.logger.error('Failed to get reservation', error, { reservationId });
      throw error;
    }
  }

  async getReservationByOrderId(orderId: string): Promise<Reservation | null> {
    const command = new QueryCommand({
      TableName: this.reservationsTableName,
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

      return Reservation.fromObject(response.Items[0]);
    } catch (error) {
      this.logger.error('Failed to get reservation by order ID', error, { orderId });
      throw error;
    }
  }

  async updateReservation(reservation: Reservation): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.reservationsTableName,
      Key: { reservationId: reservation.reservationId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': reservation.status,
        ':updatedAt': reservation.updatedAt.toISOString(),
      },
    });

    try {
      await retry(
        async () => {
          this.logger.info('Updating reservation', { 
            reservationId: reservation.reservationId,
            status: reservation.status 
          });
          return await dynamoDBDocumentClient.send(command);
        },
        { maxAttempts: 3, baseDelay: 100, jitter: true }
      );

      this.logger.info('Reservation updated', { 
        reservationId: reservation.reservationId,
        status: reservation.status 
      });
    } catch (error) {
      this.logger.error('Failed to update reservation', error, { 
        reservationId: reservation.reservationId 
      });
      throw error;
    }
  }
}