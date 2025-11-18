import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { DynamoDBOrderHistoryRepository } from '../../infrastructure/repositories/DynamoDBOrderHistoryRepository';
import { GetOrderHistory } from '../../application/usecases/GetOrderHistory';
import { requireAuth } from '../../shared/utils/auth';
import { successResponse, errorResponse } from '../../shared';

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const user = requireAuth(event);
        const orderId = event.pathParameters?.orderId;
        if(!orderId){
           return errorResponse(400, 'Order ID is required')
        }
        const orderRepository = new DynamoDBOrderRepository()
        const orderHistoryRepository = new DynamoDBOrderHistoryRepository()
        const getOrderHistory = new GetOrderHistory(orderRepository, orderHistoryRepository)
        const result = await getOrderHistory.execute({
            orderId,
            userId: user.email,
        });
        return successResponse(200, result);
    } catch(error: any) {
        if (error.message.includes('Unauthorized')) {
          return errorResponse(401, error.message);
        }
        if (error.message.includes('not found') || error.message.includes('Forbidden')) {
          return errorResponse(404, 'Order not found');
        }
        console.error('Error getting order history:', error);
        return errorResponse(500, 'Failed to get order history', error.message);
    }
}