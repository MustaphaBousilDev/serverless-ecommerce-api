// src/handlers/http/updateOrderItems.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { requireAuth } from '../../shared/utils/auth';
import { errorResponse, successResponse } from '../../shared';
import { UpdateOrderItems } from '../../application/usecases/UpdateOrderItems';


export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Get authenticated user
    const user = requireAuth(event);

    const orderId = event.pathParameters?.orderId;
    if (!orderId) {
      return errorResponse(400, 'Order ID is required');
    }

    const body = JSON.parse(event.body || '{}');
    const { action, productId, productName, quantity, unitPrice } = body;

    // Validation
    if (!action || !['add', 'remove', 'update'].includes(action)) {
      return errorResponse(400, 'Valid action (add, remove, update) is required');
    }

    if (!productId) {
      return errorResponse(400, 'productId is required');
    }

    // Execute use case
    const orderRepository = new DynamoDBOrderRepository();
    const updateOrderItems = new UpdateOrderItems(orderRepository);

    const order = await updateOrderItems.execute({
      orderId,
      userId: user.email,
      action,
      productId,
      productName,
      quantity,
      unitPrice,
    });

    return successResponse(200, {
      message: `Order items ${action}ed successfully`,
      order: order.toObject(),
    });

  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return errorResponse(401, error.message);
    }
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(404, 'Order not found');
    }
    if (error.message.includes('Cannot')) {
      return errorResponse(400, error.message);
    }
    console.error('Error updating order items:', error);
    return errorResponse(500, 'Failed to update order items', error.message);
  }
};