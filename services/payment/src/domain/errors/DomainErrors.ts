

import { AppError } from './AppError';
import { ErrorDetails } from './AppError'
import { ErrorCode } from './ErrorCodes';

export class OrderNotFoundError extends AppError {
  constructor(orderId: string, additionalDetails?: ErrorDetails) {
    super(
      ErrorCode.ORDER_NOT_FOUND,
      `Order with ID ${orderId} not found`,
      { orderId, ...additionalDetails }
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, validationErrors: string[] | ErrorDetails) {
    super(
      ErrorCode.VALIDATION_ERROR,
      message,
      { validationErrors }
    );
  }
}

export class CannotCancelShippedOrderError extends AppError {
  constructor(orderId: string, currentStatus: string) {
    super(
      ErrorCode.CANNOT_CANCEL_SHIPPED_ORDER,
      `Cannot cancel order ${orderId} because it has status: ${currentStatus}. Orders can only be cancelled when PENDING or CONFIRMED.`,
      { orderId, currentStatus }
    );
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor(orderId: string, currentStatus: string, attemptedStatus: string) {
    super(
      ErrorCode.INVALID_STATUS_TRANSITION,
      `Cannot change order ${orderId} from ${currentStatus} to ${attemptedStatus}`,
      { orderId, currentStatus, attemptedStatus }
    );
  }
}

export class OrderMinimumNotMetError extends AppError {
  constructor(totalAmount: number, minimumAmount: number) {
    super(
      ErrorCode.ORDER_MINIMUM_NOT_MET,
      `Order total ($${totalAmount.toFixed(2)}) does not meet minimum of $${minimumAmount.toFixed(2)}`,
      { totalAmount, minimumAmount }
    );
  }
}

export class OrderMaximumExceededError extends AppError {
  constructor(totalAmount: number, maximumAmount: number) {
    super(
      ErrorCode.ORDER_MAXIMUM_EXCEEDED,
      `Order total ($${totalAmount.toFixed(2)}) exceeds maximum of $${maximumAmount.toFixed(2)}`,
      { totalAmount, maximumAmount }
    );
  }
}

export class TooManyItemsError extends AppError {
  constructor(itemCount: number, maxItems: number) {
    super(
      ErrorCode.TOO_MANY_ITEMS,
      `Order has ${itemCount} items, but maximum is ${maxItems}`,
      { itemCount, maxItems }
    );
  }
}

export class ItemNotFoundInOrderError extends AppError {
  constructor(orderId: string, productId: string) {
    super(
      ErrorCode.ITEM_NOT_FOUND_IN_ORDER,
      `Product ${productId} not found in order ${orderId}`,
      { orderId, productId }
    );
  }
}


export class CannotRemoveLastItemError extends AppError {
  constructor(orderId: string) {
    super(
      ErrorCode.CANNOT_REMOVE_LAST_ITEM,
      `Cannot remove last item from order ${orderId}. Cancel the order instead.`,
      { orderId }
    );
  }
}

export class CannotUpdateItemsError extends AppError {
  constructor(orderId: string, currentStatus: string) {
    super(
      ErrorCode.CANNOT_UPDATE_CANCELLED_ORDER,
      `Cannot update items in order ${orderId} with status ${currentStatus}. Items can only be updated when order is PENDING.`,
      { orderId, currentStatus }
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: ErrorDetails) {
    super(
      ErrorCode.UNAUTHORIZED,
      message,
      details
    );
  }
}


export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', details?: ErrorDetails) {
    super(
      ErrorCode.FORBIDDEN,
      message,
      details
    );
  }
}
export class DuplicateOrderError extends AppError {
  constructor(orderId: string) {
    super(
      ErrorCode.DUPLICATE_ORDER,
      `Order with ID ${orderId} already exists`,
      { orderId }
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(
      ErrorCode.DATABASE_ERROR,
      message,
      details,
      false // Not operational - infrastructure issue
    );
  }
}

export class DatabaseThrottledError extends AppError {
  constructor(tableName: string) {
    super(
      ErrorCode.DATABASE_THROTTLED,
      `Database throttled for table: ${tableName}. Please retry.`,
      { tableName },
      false
    );
  }
}

export class EventPublishFailedError extends AppError {
  constructor(eventType: string, details?: ErrorDetails) {
    super(
      ErrorCode.EVENT_PUBLISH_FAILED,
      `Failed to publish ${eventType} event`,
      { eventType, ...details },
      false
    );
  }
}


