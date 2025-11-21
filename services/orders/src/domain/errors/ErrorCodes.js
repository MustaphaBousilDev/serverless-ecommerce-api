"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
exports.getHttpStatusForErrorCode = getHttpStatusForErrorCode;
var ErrorCode;
(function (ErrorCode) {
    //400 Client Errors (Users Mistakes)
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["ORDER_NOT_FOUND"] = "ORDER_NOT_FOUND";
    ErrorCode["DUPLICATE_ORDER"] = "DUPLICATE_ORDER";
    ErrorCode["INVALID_STATUS_TRANSITION"] = "INVALID_STATUS_TRANSITION";
    ErrorCode["CANNOT_CANCEL_SHIPPED_ORDER"] = "CANNOT_CANCEL_SHIPPED_ORDER";
    ErrorCode["CANNOT_UPDATE_CANCELLED_ORDER"] = "CANNOT_UPDATE_CANCELLED_ORDER";
    ErrorCode["ORDER_MINIMUM_NOT_MET"] = "ORDER_MINIMUM_NOT_MET";
    ErrorCode["ORDER_MAXIMUM_EXCEEDED"] = "ORDER_MAXIMUM_EXCEEDED";
    ErrorCode["TOO_MANY_ITEMS"] = "TOO_MANY_ITEMS";
    ErrorCode["TOO_FEW_ITEMS"] = "TOO_FEW_ITEMS";
    ErrorCode["INVALID_ORDER_STATUS"] = "INVALID_ORDER_STATUS";
    ErrorCode["ITEM_NOT_FOUND_IN_ORDER"] = "ITEM_NOT_FOUND_IN_ORDER";
    ErrorCode["CANNOT_REMOVE_LAST_ITEM"] = "CANNOT_REMOVE_LAST_ITEM";
    //401 - Authentication Errors
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCode["INVALID_TOKEN"] = "INVALID_TOKEN";
    ErrorCode["MISSING_TOKEN"] = "MISSING_TOKEN";
    //403 - Authorization Error
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ErrorCode["ACCESS_DENIED"] = "ACCESS_DENIED";
    //404 - Not Found
    ErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    //409 - Conflit
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["ORDER_ALREADY_EXISTS"] = "ORDER_ALREADY_EXISTS";
    //429 - Rate Limiting
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCode["TOO_MANY_REQUESTS"] = "TOO_MANY_REQUESTS";
    //500 Server Error
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["DATABASE_TIMEOUT"] = "DATABASE_TIMEOUT";
    ErrorCode["DATABASE_THROTTLED"] = "DATABASE_THROTTLED";
    ErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCode["EVENT_PUBLISH_FAILED"] = "EVENT_PUBLISH_FAILED";
    //503 - Service Unavailable
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCode["DATABASE_UNAVAILABLE"] = "DATABASE_UNAVAILABLE";
    ErrorCode["MAINTENANCE_MODE"] = "MAINTENANCE_MODE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
function getHttpStatusForErrorCode(code) {
    const statusMap = {
        // 400
        [ErrorCode.VALIDATION_ERROR]: 400,
        [ErrorCode.INVALID_INPUT]: 400,
        [ErrorCode.INVALID_STATUS_TRANSITION]: 400,
        [ErrorCode.CANNOT_CANCEL_SHIPPED_ORDER]: 400,
        [ErrorCode.CANNOT_UPDATE_CANCELLED_ORDER]: 400,
        [ErrorCode.ORDER_MINIMUM_NOT_MET]: 400,
        [ErrorCode.ORDER_MAXIMUM_EXCEEDED]: 400,
        [ErrorCode.TOO_MANY_ITEMS]: 400,
        [ErrorCode.TOO_FEW_ITEMS]: 400,
        [ErrorCode.INVALID_ORDER_STATUS]: 400,
        [ErrorCode.ITEM_NOT_FOUND_IN_ORDER]: 400,
        [ErrorCode.CANNOT_REMOVE_LAST_ITEM]: 400,
        // 401
        [ErrorCode.UNAUTHORIZED]: 401,
        [ErrorCode.TOKEN_EXPIRED]: 401,
        [ErrorCode.INVALID_TOKEN]: 401,
        [ErrorCode.MISSING_TOKEN]: 401,
        // 403
        [ErrorCode.FORBIDDEN]: 403,
        [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
        [ErrorCode.ACCESS_DENIED]: 403,
        // 404
        [ErrorCode.ORDER_NOT_FOUND]: 404,
        [ErrorCode.RESOURCE_NOT_FOUND]: 404,
        // 409
        [ErrorCode.DUPLICATE_ORDER]: 409,
        [ErrorCode.ORDER_ALREADY_EXISTS]: 409,
        [ErrorCode.CONFLICT]: 409,
        // 429
        [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
        [ErrorCode.TOO_MANY_REQUESTS]: 429,
        // 500
        [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
        [ErrorCode.DATABASE_ERROR]: 500,
        [ErrorCode.DATABASE_TIMEOUT]: 500,
        [ErrorCode.EXTERNAL_SERVICE_ERROR]: 500,
        [ErrorCode.EVENT_PUBLISH_FAILED]: 500,
        // 503
        [ErrorCode.SERVICE_UNAVAILABLE]: 503,
        [ErrorCode.DATABASE_UNAVAILABLE]: 503,
        [ErrorCode.DATABASE_THROTTLED]: 503,
        [ErrorCode.MAINTENANCE_MODE]: 503,
    };
    return statusMap[code] || 500;
}
