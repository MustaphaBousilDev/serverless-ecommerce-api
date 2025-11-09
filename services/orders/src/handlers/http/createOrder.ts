import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateOrderUseCase } from '../../application/usecases/CreateOrderUseCase';
import { DynamoDBOrderRepository } from '../../infrastructure/repositories/DynamoDBOrderRepository';
import { OrderValidator } from '../../interfaces/validators/OrderValidator';
import { CreateOrderRequestDto } from '../../interfaces/dtos/CreateOrderDto';
import { created, badRequest, internalError, errorResponse } from '../../shared/utils/response';
import { createLogger } from '../../shared/utils/logger';
import { ValidationError } from '../../shared/errors';
import { getUserFromEvent, requireAuth } from '../../shared/utils/auth';

const logger = createLogger('CreateOrderHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {



  logger.info('CreateOrder handler invoked', { requestId: event.requestContext.requestId });
  


  try {
     const user = requireAuth(event);
     console.log('Creating order for user:', user.email);
    if (!event.body) {
      logger.warn('Request body is empty');
      return badRequest('Request body is required');
    }

    const requestBody: CreateOrderRequestDto = JSON.parse(event.body);
    logger.debug('Parsed request body', { userId: user.email });


    const validation = OrderValidator.validateCreateOrder(requestBody);
    if (!validation.isValid) {
      logger.warn('Validation failed', { errors: validation.errors });
      return badRequest('Validation failed', validation.errors);
    }

    const orderRepository = new DynamoDBOrderRepository();
    const createOrderUseCase = new CreateOrderUseCase(orderRepository);

    logger.info('Creating order', { userId: user.email, itemCount: requestBody.items.length });
    
    const result = await createOrderUseCase.execute({
      userId: user.email,
      items: requestBody.items,
      shippingAddress: requestBody.shippingAddress,
    });

    logger.info('Order created successfully', { orderId: result.orderId });

    return created(result, 'Order created successfully');
  } catch (error: any) {
    if (error instanceof ValidationError) {
      logger.warn('Validation error', { error: error.message });
      return badRequest(error.message, error.validationErrors);
    }

    logger.error('Unexpected error creating order', error);
    return internalError('Failed to create order');
  }
};

