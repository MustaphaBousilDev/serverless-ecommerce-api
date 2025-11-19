import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ListOrdersUseCase } from '../../application/usecases/ListOrdersUseCase';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { OrderValidator } from '../../interfaces/validators/OrderValidator';
import { ok, badRequest, internalError, errorResponse } from '../../shared/utils/response';
import { createLogger } from '../../shared/utils/logger';
import { ValidationError } from '../../shared/errors';
import { requireAuth } from '../../shared/utils/auth';
import { OrderStatus } from '../../domain/entities/Order';


const logger = createLogger('ListOrdersHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('ListOrders handler invoked', { requestId: event.requestContext.requestId });
    try {
        const user = requireAuth(event);
        console.log('Listing orders for user:', user.email);
        if (!user.email) {
           logger.warn('User ID is missing from query parameters');
           return badRequest('User ID is required as query parameter');
        }
        const queryParams = event.queryStringParameters || {}
        const filters = {
            status: queryParams.status as OrderStatus | undefined,
            fromDate: queryParams.fromDate,
            toDate: queryParams.toDate,
            minAmount: queryParams.minAmount ? parseFloat(queryParams.minAmount) : undefined,
            maxAmount: queryParams.maxAmount ? parseFloat(queryParams.maxAmount) : undefined,
            sortBy: queryParams.sortBy || 'createdAt',
            sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
            limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
            lastEvaluatedKey: queryParams.cursor, // for pagination
        }
        if(filters.status && !Object.values(OrderStatus).includes(filters.status)){
           return errorResponse(400, `Invalid status: ${filters.status}`)
        }
        if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
           return errorResponse(400, 'Limit must be between 1 and 100');
        }
        if (filters.fromDate && isNaN(Date.parse(filters.fromDate))) {
           return errorResponse(400, 'Invalid fromDate format. Use ISO 8601 format.');
        }
        if (filters.toDate && isNaN(Date.parse(filters.toDate))) {
           return errorResponse(400, 'Invalid toDate format. Use ISO 8601 format.');
        }


        logger.debug('Listing orders', { user });
        const validation = OrderValidator.validateListOrders(user.email);
        if (!validation.isValid) {
           logger.warn('Validation failed', { errors: validation.errors });
           return badRequest('Validation failed', validation.errors);
        }
        const orderRepository = new DynamoDBOrderRepository();
        const listOrdersUseCase = new ListOrdersUseCase(orderRepository);
        const result = await listOrdersUseCase.execute({ 
            userId: user.email,
            filters
        });
        logger.info('======= Orders retrieved successfully ====', { userId: user.email, count: result.count });
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