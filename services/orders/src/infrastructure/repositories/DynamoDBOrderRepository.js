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
exports.DynamoDBOrderRepository = void 0;
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var dynamodb_1 = require("../config/dynamodb");
var aws_config_1 = require("../config/aws-config");
var Order_1 = require("../../domain/entities/Order");
var DynamoDBOrderRepository = /** @class */ (function () {
    function DynamoDBOrderRepository() {
        this.tableName = aws_config_1.TABLE_NAMES.ORDERS;
    }
    DynamoDBOrderRepository.prototype.save = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var item, command, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.toDynamoDBItem(order);
                        command = new lib_dynamodb_1.PutCommand({
                            TableName: this.tableName,
                            Item: item,
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, dynamodb_1.dynamoDBDocumentClient.send(command)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error saving order to DynamoDB: ', error_1);
                        throw new Error('Failed to save order');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBOrderRepository.prototype.findById = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var command, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = new lib_dynamodb_1.GetCommand({
                            TableName: this.tableName,
                            Key: {
                                orderId: orderId.value
                            }
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, dynamodb_1.dynamoDBDocumentClient.send(command)];
                    case 2:
                        response = _a.sent();
                        if (!response.Item) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, Order_1.Order.fromObject(response.Item)];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error getting order Item From DynamoDB: ', error_2);
                        throw new Error('Failed to get order');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBOrderRepository.prototype.findByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var command, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = new lib_dynamodb_1.QueryCommand({
                            TableName: this.tableName,
                            IndexName: 'UserOrdersIndex', // GSI name from CloudFormation
                            KeyConditionExpression: 'userId = :userId',
                            ExpressionAttributeValues: {
                                ':userId': userId
                            },
                            ScanIndexForward: false, // Sort Descending (newest first)
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, dynamodb_1.dynamoDBDocumentClient.send(command)];
                    case 2:
                        response = _a.sent();
                        if (!response.Items || response.Items.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, response.Items.map(function (item) { return Order_1.Order.fromObject(item); })];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error querying orders from DynamoDB: ', error_3);
                        throw new Error('Failed to query orders');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBOrderRepository.prototype.update = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var item, command, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.toDynamoDBItem(order);
                        command = new lib_dynamodb_1.UpdateCommand({
                            TableName: this.tableName,
                            Key: {
                                orderId: order.orderId.value,
                            },
                            UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt, #items = :items, #totalAmount = :totalAmount',
                            ExpressionAttributeNames: {
                                '#status': 'status',
                                '#updatedAt': 'updatedAt',
                                '#items': 'items',
                                '#totalAmount': 'totalAmount',
                            },
                            ExpressionAttributeValues: {
                                ':status': item.status,
                                ':updatedAt': item.updatedAt,
                                ':items': item.items,
                                ':totalAmount': item.totalAmount,
                            }
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, dynamodb_1.dynamoDBDocumentClient.send(command)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error updating order in DynamoDB:', error_4);
                        throw new Error('Failed to update order');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBOrderRepository.prototype.delete = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var command, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = new lib_dynamodb_1.DeleteCommand({
                            TableName: this.tableName,
                            Key: {
                                orderId: orderId.value
                            }
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, dynamodb_1.dynamoDBDocumentClient.send(command)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error Deleting order from DynamoDB:', error_5);
                        throw new Error('Failed to delete order');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBOrderRepository.prototype.toDynamoDBItem = function (order) {
        return order.toObject();
    };
    return DynamoDBOrderRepository;
}());
exports.DynamoDBOrderRepository = DynamoDBOrderRepository;
