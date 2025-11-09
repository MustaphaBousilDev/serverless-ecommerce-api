import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateOrderStatusUseCase } from '../../application/usecases/UpdateOrderUseCase'; 
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { ok, badRequest, notFound, internalError } from '../../shared/utils/response';
import { createLogger } from '../../shared/utils/logger';
import { ValidationError } from '../../shared/errors';
import { OrderStatus } from '../../domain/entities/Order';
import { requireAuth } from '../../shared/utils/auth';

const logger = createLogger('UpdateOrderStatusHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('UpdateOrderStatus handler invoked', { requestId: event.requestContext.requestId });

  try {
    const user = requireAuth(event);
    console.log('Listing orders for user:', user.email);
    // 1. Get orderId from path parameters
    const orderId = event.pathParameters?.orderId;

    if (!orderId) {
      logger.warn('Order ID is missing from path parameters');
      return badRequest('Order ID is required');
    }

    // 2. Parse request body
    if (!event.body) {
      logger.warn('Request body is empty');
      return badRequest('Request body is required');
    }

    const body = JSON.parse(event.body);

    // 3. Validate status
    if (!body.status) {
      return badRequest('Status is required');
    }

    if (!Object.values(OrderStatus).includes(body.status)) {
      return badRequest(`Invalid status. Allowed values: ${Object.values(OrderStatus).join(', ')}`);
    }

    logger.debug('Updating order status', { orderId, status: body.status });

    // 4. Initialize dependencies
    const orderRepository = new DynamoDBOrderRepository();
    const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

    // 5. Execute use case
    const result = await updateOrderStatusUseCase.execute({
      orderId,
      status: body.status,
      
    }, user);

    logger.info('Order status updated successfully', { orderId });

    // 6. Return response
    return ok(result, 'Order status updated successfully');

  } catch (error: any) {
    // Handle specific errors
    if (error instanceof ValidationError) {
      logger.warn('Validation error', { error: error.message });
      return badRequest(error.message, error.validationErrors);
    }

    if (error.message === 'Order not found') {
      logger.warn('Order not found', { error: error.message });
      return notFound('Order not found');
    }

    // Handle unexpected errors
    logger.error('Unexpected error updating order status', error);
    return internalError('Failed to update order status');
  }
};