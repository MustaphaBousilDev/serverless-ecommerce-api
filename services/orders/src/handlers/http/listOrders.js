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
var ListOrdersUseCase_1 = require("../../application/usecases/ListOrdersUseCase");
var DynamoDBOrderRepository_1 = require("../../infrastructure/repositories/DynamoDBOrderRepository");
var OrderValidator_1 = require("../../interfaces/validators/OrderValidator");
var response_1 = require("../../shared/utils/response");
var logger_1 = require("../../shared/utils/logger");
var errors_1 = require("../../shared/errors");
var logger = (0, logger_1.createLogger)('ListOrdersHandler');
var handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, validation, orderRepository, listOrdersUseCase, result, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                logger.info('ListOrders handler invoked', { requestId: event.requestContext.requestId });
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                userId = (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    logger.warn('User ID is missing from query parameters');
                    return [2 /*return*/, (0, response_1.badRequest)('User ID is required as query parameter')];
                }
                logger.debug('Listing orders', { userId: userId });
                validation = OrderValidator_1.OrderValidator.validateListOrders(userId);
                if (!validation.isValid) {
                    logger.warn('Validation failed', { errors: validation.errors });
                    return [2 /*return*/, (0, response_1.badRequest)('Validation failed', validation.errors)];
                }
                orderRepository = new DynamoDBOrderRepository_1.DynamoDBOrderRepository();
                listOrdersUseCase = new ListOrdersUseCase_1.ListOrdersUseCase(orderRepository);
                return [4 /*yield*/, listOrdersUseCase.execute({ userId: userId })];
            case 2:
                result = _b.sent();
                logger.info('======= Orders retrieved successfully ====', { userId: userId, count: result.count });
                return [2 /*return*/, (0, response_1.ok)(result, 'Orders retrieved successfully')];
            case 3:
                error_1 = _b.sent();
                if (error_1 instanceof errors_1.ValidationError) {
                    logger.warn('Validation error', { error: error_1.message });
                    return [2 /*return*/, (0, response_1.badRequest)(error_1.message, error_1.validationErrors)];
                }
                logger.error('Unexpected error listing orders', error_1);
                return [2 /*return*/, (0, response_1.internalError)('Failed to retrieve orders')];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
