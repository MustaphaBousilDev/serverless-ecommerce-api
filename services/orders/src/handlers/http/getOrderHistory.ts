import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { DynamoDBOrderHistoryRepository } from '../../infrastructure/repositories/DynamoDBOrderHistoryRepository';
import { GetOrderHistory } from '../../application/usecases/GetOrderHistory';
import { requireAuth } from '../../shared/utils/auth';
import { successResponse, errorResponse, createLogger } from '../../shared';
import { getCorrelationId } from '../../shared/utils/correlationId';

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const user = requireAuth(event);
        const correlationId = getCorrelationId(event);
        const logger = createLogger(correlationId);
        logger.info('GetOrderHistory request received');
        const orderId = event.pathParameters?.orderId;
        if(!orderId){
          logger.warn('Order ID missing in request');
           return errorResponse(400, 'Order ID is required')
        }
        logger.addContext({ orderId, userId: user.email });
        const orderRepository = new DynamoDBOrderRepository()
        const orderHistoryRepository = new DynamoDBOrderHistoryRepository()
        const getOrderHistory = new GetOrderHistory(orderRepository, orderHistoryRepository)
        logger.info('Fetching order history');
        const result = await getOrderHistory.execute({
            orderId,
            userId: user.email,
        });
        logger.info('Order history retrieved successfully', {
            historyCount: result.history?.length || 0
        });
        return successResponse(200, result);
    } catch(error: any) {
        const correlationId = getCorrelationId(event);
        const logger = createLogger(correlationId);
        if (error.message.includes('Unauthorized')) {
          logger.warn('Unauthorized access attempt');
          return errorResponse(401, error.message);
        }
        if (error.message.includes('not found') || error.message.includes('Forbidden')) {
          logger.warn('Order not found or forbidden');
          return errorResponse(404, 'Order not found');
        }
        logger.error('Error getting order history', error);
        return errorResponse(500, 'Failed to get order history', error.message);
    }
}