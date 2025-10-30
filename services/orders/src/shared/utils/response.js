"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = exports.created = exports.internalError = exports.notFound = exports.badRequest = exports.error = exports.success = void 0;
/**
 * Success Response (200)
 */
var success = function (statusCode, data, message) {
    if (message === void 0) { message = 'Success'; }
    var response = {
        success: true,
        data: data,
        message: message,
    };
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // CORS
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(response),
    };
};
exports.success = success;
/**
 * Error Response
 */
var error = function (statusCode, message, errorDetails, errorCode) {
    var response = {
        success: false,
        message: message,
        error: {
            code: errorCode || "ERROR_".concat(statusCode),
            details: errorDetails,
        },
    };
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(response),
    };
};
exports.error = error;
/**
 * 400 - Bad Request
 */
var badRequest = function (message, details) {
    if (message === void 0) { message = 'Bad Request'; }
    return (0, exports.error)(400, message, details, 'BAD_REQUEST');
};
exports.badRequest = badRequest;
/**
 * 404 - Not Found
 */
var notFound = function (message) {
    if (message === void 0) { message = 'Resource not found'; }
    return (0, exports.error)(404, message, null, 'NOT_FOUND');
};
exports.notFound = notFound;
/**
 * 500 - Internal Server Error
 */
var internalError = function (message, details) {
    if (message === void 0) { message = 'Internal server error'; }
    return (0, exports.error)(500, message, details, 'INTERNAL_ERROR');
};
exports.internalError = internalError;
/**
 * 201 - Created
 */
var created = function (data, message) {
    if (message === void 0) { message = 'Resource created successfully'; }
    return (0, exports.success)(201, data, message);
};
exports.created = created;
/**
 * 200 - OK
 */
var ok = function (data, message) {
    if (message === void 0) { message = 'Success'; }
    return (0, exports.success)(200, data, message);
};
exports.ok = ok;
