import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateOrderUseCase } from '../../application/usecases/CreateOrderUseCase';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { OrderValidator } from '../../interfaces/validators/OrderValidator';
import { CreateOrderRequestDto } from '../../interfaces/dtos/CreateOrderDto';
import { created, badRequest, internalError, errorResponse } from '../../shared/utils/response';

import { ValidationError } from '../../shared/errors';
import { getUserFromEvent, requireAuth } from '../../shared/utils/auth';
import { checkIdempotency, storeIdempotentResponse } from '../../shared/utils/idempotency';
import { createLogger } from '../../shared/utils/logger';
import { withErrorHandling } from '../../shared/utils/errorHandler';
import { getCorrelationId } from '../../shared/utils/correlationId';



export const handlerLogic = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = getCorrelationId(event);
  const logger = createLogger(correlationId);
  logger.info('CreateOrder request received', {
    path: event.path,
    method: event.httpMethod
  })
  
  try {
     const user = requireAuth(event);
     logger.addContext({ userId: user.email });
     const idempotencyResult = await checkIdempotency(event, user.email);
     if (idempotencyResult.isIdempotent) {
      logger.info('Returning Cached response (idempotent request)' , {
        idempotencyKey: idempotencyResult.idempotencyKey
      })
      return idempotencyResult.existingResponse;
     }
     const body = JSON.parse(event.body || '{}');
     
    if (!event.body) {
      logger.warn('Request body is empty');
      return badRequest('Request body is required');
    }
    
    logger.info('Creating order', {
      itemCount: body.items?.length,
      idempotencyKey: idempotencyResult.idempotencyKey,
    });

    const requestBody: CreateOrderRequestDto = JSON.parse(event.body);
    logger.debug('Parsed request body', { userId: user.email });


    const validation = OrderValidator.validateCreateOrder(requestBody);
    if (!validation.isValid) {
      logger.warn('Validation failed', { errors: validation.errors });
      return badRequest('Validation failed', validation.errors);
    }

    const orderRepository = new DynamoDBOrderRepository();
    const createOrderUseCase = new CreateOrderUseCase(orderRepository,correlationId);

    logger.info('Creating order', { userId: user.email, itemCount: requestBody.items.length });
    
    const result = await createOrderUseCase.execute({
      userId: user.email,
      items: requestBody.items,
      shippingAddress: requestBody.shippingAddress,
    });

    logger.info('Order created successfully', { orderId: result.orderId });

    
    const response =  created(result, 'Order created successfully');
    await storeIdempotentResponse(idempotencyResult.idempotencyKey, response);
    return response
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return errorResponse(401, error.message);
    }
    if (error instanceof ValidationError) {
      logger.warn('Validation error', { error: error.message });
      return badRequest(error.message, error.validationErrors);
    }

    logger.error('Unexpected error creating order', error);
    return internalError('Failed to create order');
  }
};

export const handler = withErrorHandling(handlerLogic)
