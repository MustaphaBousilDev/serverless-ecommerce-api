"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublishFailedError = exports.DatabaseThrottledError = exports.DatabaseError = exports.DuplicateOrderError = exports.ForbiddenError = exports.UnauthorizedError = exports.CannotUpdateItemsError = exports.CannotRemoveLastItemError = exports.ItemNotFoundInOrderError = exports.TooManyItemsError = exports.OrderMaximumExceededError = exports.OrderMinimumNotMetError = exports.InvalidStatusTransitionError = exports.CannotCancelShippedOrderError = exports.ValidationError = exports.OrderNotFoundError = void 0;
const AppError_1 = require("./AppError");
const ErrorCodes_1 = require("./ErrorCodes");
class OrderNotFoundError extends AppError_1.AppError {
    constructor(orderId, additionalDetails) {
        super(ErrorCodes_1.ErrorCode.ORDER_NOT_FOUND, `Order with ID ${orderId} not found`, { orderId, ...additionalDetails });
    }
}
exports.OrderNotFoundError = OrderNotFoundError;
class ValidationError extends AppError_1.AppError {
    constructor(message, validationErrors) {
        super(ErrorCodes_1.ErrorCode.VALIDATION_ERROR, message, { validationErrors });
    }
}
exports.ValidationError = ValidationError;
class CannotCancelShippedOrderError extends AppError_1.AppError {
    constructor(orderId, currentStatus) {
        super(ErrorCodes_1.ErrorCode.CANNOT_CANCEL_SHIPPED_ORDER, `Cannot cancel order ${orderId} because it has status: ${currentStatus}. Orders can only be cancelled when PENDING or CONFIRMED.`, { orderId, currentStatus });
    }
}
exports.CannotCancelShippedOrderError = CannotCancelShippedOrderError;
class InvalidStatusTransitionError extends AppError_1.AppError {
    constructor(orderId, currentStatus, attemptedStatus) {
        super(ErrorCodes_1.ErrorCode.INVALID_STATUS_TRANSITION, `Cannot change order ${orderId} from ${currentStatus} to ${attemptedStatus}`, { orderId, currentStatus, attemptedStatus });
    }
}
exports.InvalidStatusTransitionError = InvalidStatusTransitionError;
class OrderMinimumNotMetError extends AppError_1.AppError {
    constructor(totalAmount, minimumAmount) {
        super(ErrorCodes_1.ErrorCode.ORDER_MINIMUM_NOT_MET, `Order total ($${totalAmount.toFixed(2)}) does not meet minimum of $${minimumAmount.toFixed(2)}`, { totalAmount, minimumAmount });
    }
}
exports.OrderMinimumNotMetError = OrderMinimumNotMetError;
class OrderMaximumExceededError extends AppError_1.AppError {
    constructor(totalAmount, maximumAmount) {
        super(ErrorCodes_1.ErrorCode.ORDER_MAXIMUM_EXCEEDED, `Order total ($${totalAmount.toFixed(2)}) exceeds maximum of $${maximumAmount.toFixed(2)}`, { totalAmount, maximumAmount });
    }
}
exports.OrderMaximumExceededError = OrderMaximumExceededError;
class TooManyItemsError extends AppError_1.AppError {
    constructor(itemCount, maxItems) {
        super(ErrorCodes_1.ErrorCode.TOO_MANY_ITEMS, `Order has ${itemCount} items, but maximum is ${maxItems}`, { itemCount, maxItems });
    }
}
exports.TooManyItemsError = TooManyItemsError;
class ItemNotFoundInOrderError extends AppError_1.AppError {
    constructor(orderId, productId) {
        super(ErrorCodes_1.ErrorCode.ITEM_NOT_FOUND_IN_ORDER, `Product ${productId} not found in order ${orderId}`, { orderId, productId });
    }
}
exports.ItemNotFoundInOrderError = ItemNotFoundInOrderError;
class CannotRemoveLastItemError extends AppError_1.AppError {
    constructor(orderId) {
        super(ErrorCodes_1.ErrorCode.CANNOT_REMOVE_LAST_ITEM, `Cannot remove last item from order ${orderId}. Cancel the order instead.`, { orderId });
    }
}
exports.CannotRemoveLastItemError = CannotRemoveLastItemError;
class CannotUpdateItemsError extends AppError_1.AppError {
    constructor(orderId, currentStatus) {
        super(ErrorCodes_1.ErrorCode.CANNOT_UPDATE_CANCELLED_ORDER, `Cannot update items in order ${orderId} with status ${currentStatus}. Items can only be updated when order is PENDING.`, { orderId, currentStatus });
    }
}
exports.CannotUpdateItemsError = CannotUpdateItemsError;
class UnauthorizedError extends AppError_1.AppError {
    constructor(message = 'Unauthorized access', details) {
        super(ErrorCodes_1.ErrorCode.UNAUTHORIZED, message, details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError_1.AppError {
    constructor(message = 'Access denied', details) {
        super(ErrorCodes_1.ErrorCode.FORBIDDEN, message, details);
    }
}
exports.ForbiddenError = ForbiddenError;
class DuplicateOrderError extends AppError_1.AppError {
    constructor(orderId) {
        super(ErrorCodes_1.ErrorCode.DUPLICATE_ORDER, `Order with ID ${orderId} already exists`, { orderId });
    }
}
exports.DuplicateOrderError = DuplicateOrderError;
class DatabaseError extends AppError_1.AppError {
    constructor(message, details) {
        super(ErrorCodes_1.ErrorCode.DATABASE_ERROR, message, details, false // Not operational - infrastructure issue
        );
    }
}
exports.DatabaseError = DatabaseError;
class DatabaseThrottledError extends AppError_1.AppError {
    constructor(tableName) {
        super(ErrorCodes_1.ErrorCode.DATABASE_THROTTLED, `Database throttled for table: ${tableName}. Please retry.`, { tableName }, false);
    }
}
exports.DatabaseThrottledError = DatabaseThrottledError;
class EventPublishFailedError extends AppError_1.AppError {
    constructor(eventType, details) {
        super(ErrorCodes_1.ErrorCode.EVENT_PUBLISH_FAILED, `Failed to publish ${eventType} event`, { eventType, ...details }, false);
    }
}
exports.EventPublishFailedError = EventPublishFailedError;
