import { APIGatewayProxyHandler } from "aws-lambda";
import { requireAuth } from "../../shared/utils/auth";
import { errorResponse, successResponse } from "../../shared";
import { DynamoDBOrderRepository } from "../../infrastructure/repositories/DynamoDBOrderRepository";
import { EventPublisher } from "../../infrastructure/events/EventPublisher";
import { CancelOrder } from "../../application/usecases/CancelOrder";

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const user = requireAuth(event);
        const orderId = event.pathParameters?.orderId;
        if (!orderId) {
           return errorResponse(400, 'Order ID is required');
        }
        const body = JSON.parse(event.body || '{}');
        const { reason } = body;
        const orderRepository = new DynamoDBOrderRepository();
        const eventPublisher = new EventPublisher();
        const cancelOrder = new CancelOrder(orderRepository, eventPublisher);
        const order = await cancelOrder.execute({
            orderId,
            userId: user.email,
            reason,
        });
        return successResponse(200, {
            message: 'Order cancelled successfully',
            order: order.toObject(),
        });

    } catch(error: any) {
        if (error.message.includes('Unauthorized')) {
           return errorResponse(401, error.message);
        }
        if (error.message.includes('not found') || error.message.includes('access denied')) {
            return errorResponse(404, 'Order not found');
        }
        if (error.message.includes('Cannot cancel')) {
            return errorResponse(400, error.message);
        }
        console.error('Error cancelling order:', error);
        return errorResponse(500, 'Failed to cancel order', error.message);
    }
}