import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient, dynamoDBDocumentClient } from "../config/dynamodb";
import { TABLE_NAMES } from "../config/aws-config";
import { createLogger } from "../../shared";
import { SagaEventType } from "../../domain/events/SagaEvents";

export enum SagaStatus {
    STARTED = "STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    COMPENSATING = "COMPENSATING",
    COMPENSATED = "COMPENSATED",
    FAILED = "FAILED"
}

export interface SagaState {
    sagaId: string;
    orderId: string;
    status: SagaStatus;
    currentStep: number;
    totalSteps: number;
    startedAt: string;
    completedAt?: string;
    failedAt?: string;
    events: Array<{
        eventType: SagaEventType;
        timestamp: string; 
        stepNumber: number;
        isCompensation: boolean;
        data:any
    }>;
    componsationEvents: Array<{
        eventType: SagaEventType;
        timestamp: string;
        stepNumber: number;
        data: any;
    }>;
    errorDetails?: {
        step: number;
        eventType: string;
        error: string;
        timestamp: string;
    }
}

export class SagaStateRepository {
    private tableName: string;
    private logger: any;

    constructor(correlationId?: string){
        this.tableName = TABLE_NAMES.ORDER_HISTORY;
        this.logger = createLogger(correlationId || 'no-correlation-id')
    }

    async createSaga(sagaState: SagaState): Promise<void>{
       const command  = new PutCommand({
            TableName: this.tableName,
            Item: {
                
                eventType: `SAGA#${sagaState.sagaId}`,
                ...sagaState,
                orderId: sagaState.orderId, // for only visibility because orderId was setted here (...sagaState,)
                createdAt: new Date().toISOString(),
            }
       })
       try {
          await dynamoDBDocumentClient.send(command)
          this.logger.info('Saga state created', {
            sagaId: sagaState.sagaId
          })
       } catch(error){
          this.logger.error('Failed to create saga state', error)
       }
    }

    async getSaga(sagaId: string, orderId: string) : Promise<SagaState | null>{
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                orderId: orderId,
                eventType: `SAGA#${sagaId}`
            }
        })
        try {
           const response = await dynamoDBDocumentClient.send(command)
           return response.Item as SagaState | null
        } catch(error) {
            this.logger.error('Failed to get Saga state', error)
            throw error;
        }
    }

    async updateSagaStatus(
        sagaId: string,
        orderId: string,
        status: SagaStatus,
        currentStep?: number,
    ): Promise<void>{
        const updateExpression = currentStep !== undefined
          ? 'SET #status = :status, #currentStep = :currentStep, #updatedAt = :updatedAt'
          : 'SET #status = :status, #updatedAt = :updatedAt';
        const expressionAttributeValues: any = {
            ':status': status,
            ':updatedAt': new Date().toISOString(),
        };
        if (currentStep !== undefined) {
           expressionAttributeValues[':currentStep'] = currentStep;
        }
        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: {
                orderId: orderId,
                eventType: `SAGA#${sagaId}`
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: {
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                ...(currentStep !== undefined && { '#currentStep': 'currentStep' }),
            },
            ExpressionAttributeValues: expressionAttributeValues,
        })
        try {
            await dynamoDBDocumentClient.send(command);
            this.logger.info('Saga status updated', { sagaId, status, currentStep });
        } catch(error) {
            this.logger.error('Failed to update saga status', error);
            throw error;
        }

    }

    async addSagaEvent(
        sagaId: string,
        orderId: string,
            event: {
            eventType: SagaEventType;
            stepNumber: number;
            isCompensation: boolean;
            data: any;
        }
    ): Promise<void> {
        const sagaEvent = {
            ...event,
            timestamp: new Date().toISOString(),
        };
        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: {
                orderId: orderId,
                eventType: `SAGA#${sagaId}`,
            },
            UpdateExpression: 'SET #events = list_append(if_not_exists(#events, :emptyList), :newEvent)',
            ExpressionAttributeNames: {
                '#events': 'events',
            },
            ExpressionAttributeValues: {
                ':newEvent': [sagaEvent],
                ':emptyList': [],
            },
        });
        try {
            await dynamoDBDocumentClient.send(command);
            this.logger.info('Saga event added', { sagaId, eventType: event.eventType });
        } catch (error) {
            this.logger.error('Failed to add saga event', error);
            throw error;
        }
    }

    async markSagaFailed(
        sagaId: string,
        orderId: string,
        errorDetails: {
            step: number;
            eventType: string;
            error: string;
        }
    ): Promise<void>{
       const command = new UpdateCommand({
        TableName: this.tableName,
        Key: {
            orderId: orderId,
            eventType: `SAGA#${sagaId}`,
        },
        UpdateExpression: 'SET #status = :status, #failedAt = :failedAt, #errorDetails = :errorDetails',
        ExpressionAttributeNames: {
            '#status': 'status',
            '#failedAt': 'failedAt',
            '#errorDetails': 'errorDetails',
        },
        ExpressionAttributeValues: {
            ':status': SagaStatus.FAILED,
            ':failedAt': new Date().toISOString(),
            ':errorDetails': {
            ...errorDetails,
            timestamp: new Date().toISOString(),
            },
        },
       });

        try {
            await dynamoDBDocumentClient.send(command);
            this.logger.error('Saga marked as failed', { sagaId, errorDetails });
        } catch (error) {
            this.logger.error('Failed to mark saga as failed', error);
            throw error;
        }
    }
}