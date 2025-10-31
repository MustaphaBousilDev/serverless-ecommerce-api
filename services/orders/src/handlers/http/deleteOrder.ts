import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteOrderUseCase } from '../../application/usecases/DeleteOrderUseCase';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { ok, badRequest, notFound, internalError } from '../../shared/utils/response';
import { createLogger } from '../../shared/utils/logger';
import { ValidationError } from '../../shared/errors';

const logger = createLogger('DeleteOrderHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('DeleteOrder handler invoked', { requestId: event.requestContext.requestId });

  try {
    // 1. Get orderId from path parameters
    const orderId = event.pathParameters?.orderId;

    if (!orderId) {
      logger.warn('Order ID is missing from path parameters');
      return badRequest('Order ID is required');
    }

    logger.debug('Deleting order', { orderId });

    // 2. Initialize dependencies
    const orderRepository = new DynamoDBOrderRepository();
    const deleteOrderUseCase = new DeleteOrderUseCase(orderRepository);

    // 3. Execute use case
    const result = await deleteOrderUseCase.execute({ orderId });

    logger.info('Order deleted successfully', { orderId });

    // 4. Return response
    return ok(result, 'Order deleted successfully');

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

    if (error.message && error.message.includes('Cannot delete order')) {
      logger.warn('Cannot delete order', { error: error.message });
      return badRequest(error.message);
    }

    // Handle unexpected errors
    logger.error('Unexpected error deleting order', error);
    return internalError('Failed to delete order');
  }
};