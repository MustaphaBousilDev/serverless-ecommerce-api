import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ListOrdersUseCase } from '../../application/usecases/ListOrdersUseCase';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { OrderValidator } from '../../interfaces/validators/OrderValidator';
import { ok, badRequest, internalError } from '../../shared/utils/response';
import { createLogger } from '../../shared/utils/logger';
import { ValidationError } from '../../shared/errors';

const logger = createLogger('ListOrdersHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('ListOrders handler invoked', { requestId: event.requestContext.requestId });
    try {
        const userId = event.queryStringParameters?.userId;
        if (!userId) {
           logger.warn('User ID is missing from query parameters');
           return badRequest('User ID is required as query parameter');
        }
        logger.debug('Listing orders', { userId });
        const validation = OrderValidator.validateListOrders(userId);
        if (!validation.isValid) {
           logger.warn('Validation failed', { errors: validation.errors });
           return badRequest('Validation failed', validation.errors);
        }
        const orderRepository = new DynamoDBOrderRepository();
        const listOrdersUseCase = new ListOrdersUseCase(orderRepository);
        const result = await listOrdersUseCase.execute({ userId });
        logger.info('======= Orders retrieved successfully ====', { userId, count: result.count });
        return ok(result, 'Orders retrieved successfully');
    } catch(error: any) {
        if (error instanceof ValidationError) {
           logger.warn('Validation error', { error: error.message });
           return badRequest(error.message, error.validationErrors);
        }
        logger.error('Unexpected error listing orders', error);
        return internalError('Failed to retrieve orders');
    }
}