import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetOrderUseCase } from '../../application/usecases/GetOrderUseCase';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { OrderValidator } from '../../interfaces/validators/OrderValidator';
import { ok, badRequest, notFound, internalError } from '../../shared/utils/response';
import { createLogger } from '../../shared/utils/logger';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { requireAuth } from '../../shared/utils/auth';
import { withErrorHandling } from '../../shared/utils/errorHandler';

const logger  = createLogger('GetOrderHandler')

export const handlerLogic = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('========== Get Order handler invoked : ', {
        requestId : event.requestContext.requestId
    })
    try {
        const user = requireAuth(event);
        const orderId = event.pathParameters?.orderId
        if(!orderId){
            logger.warn('Order ID is missing from path parameters')
            return badRequest('Order ID is required')
        }
        logger.debug('Getting order', { orderId })

        const validation = OrderValidator.validateGetOrder(orderId)
        if(!validation.isValid){
           logger.warn('===== Validation failed ====== ', {
            errors: validation.errors
           })
           return badRequest('Validation failed', validation.errors)
        }
        const orderRepository = new DynamoDBOrderRepository()
        const getOrderUseCase = new GetOrderUseCase(orderRepository)

        const result = await getOrderUseCase.execute({ orderId }, user)
        logger.info('========= Order retrieved successfully ', { orderId })
        return ok(result, 'Order retrieved successfully')
    } catch(error: any) {
        if(error instanceof ValidationError){
           logger.warn('=====  Validation Error ========', {
            error: error.message
           })
           return badRequest(error.message, error.validationErrors)
        }

        if(error.message === 'Order not found'){
            logger.warn('Order not found', { error: error.message });
            return notFound('Order not found');
        }

        logger.error('=== Unexpected error getting order', error)
        return internalError('Failed to retrieve order')
    }
}

export const handler = withErrorHandling(handlerLogic)