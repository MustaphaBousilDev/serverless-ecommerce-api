"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var UpdateOrderUseCase_1 = require("../../application/usecases/UpdateOrderUseCase");
var DynamoDBOrderRepository_1 = require("../../infrastructure/repositories/DynamoDBOrderRepository");
var response_1 = require("../../shared/utils/response");
var logger_1 = require("../../shared/utils/logger");
var errors_1 = require("../../shared/errors");
var Order_1 = require("../../domain/entities/Order");
var logger = (0, logger_1.createLogger)('UpdateOrderStatusHandler');
var handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, body, orderRepository, updateOrderStatusUseCase, result, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                logger.info('UpdateOrderStatus handler invoked', { requestId: event.requestContext.requestId });
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                orderId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.orderId;
                if (!orderId) {
                    logger.warn('Order ID is missing from path parameters');
                    return [2 /*return*/, (0, response_1.badRequest)('Order ID is required')];
                }
                // 2. Parse request body
                if (!event.body) {
                    logger.warn('Request body is empty');
                    return [2 /*return*/, (0, response_1.badRequest)('Request body is required')];
                }
                body = JSON.parse(event.body);
                // 3. Validate status
                if (!body.status) {
                    return [2 /*return*/, (0, response_1.badRequest)('Status is required')];
                }
                if (!Object.values(Order_1.OrderStatus).includes(body.status)) {
                    return [2 /*return*/, (0, response_1.badRequest)("Invalid status. Allowed values: ".concat(Object.values(Order_1.OrderStatus).join(', ')))];
                }
                logger.debug('Updating order status', { orderId: orderId, status: body.status });
                orderRepository = new DynamoDBOrderRepository_1.DynamoDBOrderRepository();
                updateOrderStatusUseCase = new UpdateOrderUseCase_1.UpdateOrderStatusUseCase(orderRepository);
                return [4 /*yield*/, updateOrderStatusUseCase.execute({
                        orderId: orderId,
                        status: body.status,
                    })];
            case 2:
                result = _b.sent();
                logger.info('Order status updated successfully', { orderId: orderId });
                // 6. Return response
                return [2 /*return*/, (0, response_1.ok)(result, 'Order status updated successfully')];
            case 3:
                error_1 = _b.sent();
                // Handle specific errors
                if (error_1 instanceof errors_1.ValidationError) {
                    logger.warn('Validation error', { error: error_1.message });
                    return [2 /*return*/, (0, response_1.badRequest)(error_1.message, error_1.validationErrors)];
                }
                if (error_1.message === 'Order not found') {
                    logger.warn('Order not found', { error: error_1.message });
                    return [2 /*return*/, (0, response_1.notFound)('Order not found')];
                }
                // Handle unexpected errors
                logger.error('Unexpected error updating order status', error_1);
                return [2 /*return*/, (0, response_1.internalError)('Failed to update order status')];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
