"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DynamoDBOrderRepository_1 = require("../../../../src/infrastructure/repositories/DynamoDBOrderRepository");
const Order_1 = require("../../../../src/domain/entities/Order");
const OrderItem_1 = require("../../../../src/domain/entities/OrderItem");
const Address_1 = require("../../../../src/domain/value-objects/Address");
const OrderId_1 = require("../../../../src/domain/value-objects/OrderId");
const aws_sdk_client_mock_1 = require("aws-sdk-client-mock");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
// Mock DynamoDBClient
const ddbMock = (0, aws_sdk_client_mock_1.mockClient)(lib_dynamodb_1.DynamoDBDocumentClient);
describe('DynamoDBOrderRepository - Integration Tests (Mocked)', () => {
    let repository;
    let mockOrder;
    beforeAll(() => {
        process.env.ORDER_TABLE_NAME = 'dev-orders';
        process.env.AWS_REGION = 'us-east-1';
    });
    beforeEach(() => {
        //reset all mocks before each test
        ddbMock.reset();
        //Create repository
        repository = new DynamoDBOrderRepository_1.DynamoDBOrderRepository();
        //Create mock order
        const items = [
            new OrderItem_1.OrderItem({
                productId: 'prod-001',
                productName: 'LapTop',
                quantity: 1,
                unitPrice: 999.99
            })
        ];
        const address = new Address_1.Address({
            street: '13 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001'
        });
        mockOrder = Order_1.Order.create('user-123', items, address);
    });
    describe('save() method', () => {
        test('should successfully save order to DynamoDB', async () => {
            //Mock successfully DynamoDB put
            ddbMock.on(lib_dynamodb_1.PutCommand).resolves({});
            //Execute
            await repository.save(mockOrder);
            //Verify PutCommand was called
            const calls = ddbMock.commandCalls(lib_dynamodb_1.PutCommand);
            expect(calls.length).toBe(1);
            //Verify Correct Paramerts
            const putCall = calls[0];
            expect(putCall.args[0].input.TableName).toBe('dev-orders');
            expect(putCall.args[0].input.Item?.orderId).toBe(mockOrder.orderId.value);
            expect(putCall.args[0].input.Item?.userId).toBe('user-123');
            expect(putCall.args[0].input.Item?.status).toBe('PENDING');
            expect(putCall.args[0].input.Item?.totalAmount).toBe(999.99);
        });
        test('should throw error when DynamoDB save fails ', async () => {
            //Mock dynamoDB Error
            ddbMock.on(lib_dynamodb_1.PutCommand).rejects(new Error('DynamoDB is unavailable'));
            //execute and expect error
            await expect(repository.save(mockOrder)).rejects.toThrow('Failed to save order');
        });
    });
    describe('findById() method', () => {
        test('should find order by ID', async () => {
            const orderData = mockOrder.toObject();
            //Mock DynamoDB get returning order
            ddbMock.on(lib_dynamodb_1.GetCommand).resolves({
                Item: orderData
            });
            //execute
            const result = await repository.findById(mockOrder.orderId);
            //verify
            expect(result).not.toBeNull();
            expect(result?.orderId.value).toBe(mockOrder.orderId.value);
            expect(result?.userId).toBe('user-123');
            expect(result?.status).toBe('PENDING');
            //Verify GetCommand was called correctly
            const calls = ddbMock.commandCalls(lib_dynamodb_1.GetCommand);
            expect(calls.length).toBe(1);
            expect(calls[0].args[0].input.TableName).toBe('dev-orders');
            expect(calls[0].args[0].input.Key?.orderId).toBe(mockOrder.orderId.value);
        });
        test('should return null when order not found', async () => {
            // Mock DynamoDB returning no item
            ddbMock.on(lib_dynamodb_1.GetCommand).resolves({});
            //execite resule 
            const result = await repository.findById(new OrderId_1.OrderId('non-existent-id'));
            //Verify 
            expect(result).toBeNull();
        });
        test('should return error when DynamoDB Get Fails', async () => {
            ddbMock.on(lib_dynamodb_1.GetCommand).rejects(new Error('DynamoDB read error'));
            //execute and expected Error
            await expect(repository.findById(mockOrder.orderId)).rejects.toThrow('Failed to get order');
        });
    });
    describe('update() method', () => {
        test('should successfully update order in DynamoDB ', async () => {
            //Modify Order
            mockOrder.confirm();
            // Mock Successfully DynamoDB update
            ddbMock.on(lib_dynamodb_1.UpdateCommand).resolves({});
            // Execute
            await repository.update(mockOrder);
            //Verify Update Command was called
            const calls = ddbMock.commandCalls(lib_dynamodb_1.UpdateCommand);
            expect(calls.length).toBe(1);
            //Verify Correct parameters
            const updateCall = calls[0];
            expect(updateCall.args[0].input.TableName).toBe('dev-orders');
            expect(updateCall.args[0].input.Key?.orderId).toBe(mockOrder.orderId.value);
            expect(updateCall.args[0].input.ExpressionAttributeValues?.[':status']).toBe('CONFIRMED');
        });
        test('should throw error when DynamoDB update fails', async () => {
            // Modify order
            mockOrder.confirm();
            //Mock DynamoDB Error
            ddbMock.on(lib_dynamodb_1.UpdateCommand).rejects(new Error('DynamoDB update failed'));
            // Execute and expect error
            await expect(repository.update(mockOrder)).rejects.toThrow('Failed to update order');
        });
    });
    describe('delete() method', () => {
        test('should successfully delete order from DynamoDB', async () => {
            // Mock successful DynamoDB delete
            ddbMock.on(lib_dynamodb_1.DeleteCommand).resolves({});
            // Execute
            await repository.delete(mockOrder.orderId);
            // Verify DeleteCommand was called
            const calls = ddbMock.commandCalls(lib_dynamodb_1.DeleteCommand);
            expect(calls.length).toBe(1);
            // Verify correct parameters
            const deleteCall = calls[0];
            expect(deleteCall.args[0].input.TableName).toBe('dev-orders');
            expect(deleteCall.args[0].input.Key?.orderId).toBe(mockOrder.orderId.value);
        });
        test('should throw error when DynamoDB delete fails', async () => {
            ddbMock.on(lib_dynamodb_1.DeleteCommand).rejects(new Error('DynamoDB delete failed'));
            await expect(repository.delete(mockOrder.orderId)).rejects.toThrow('Failed to delete order');
        });
    });
    describe('findByUserId() method', () => {
        test('should find orders by user ID', async () => {
            const orderData = mockOrder.toObject();
            // Mock ANY DynamoDB command to see what's being called
            ddbMock.onAnyCommand().callsFake((command) => {
                console.log('Command called:', command.constructor.name);
                console.log('Command input:', command.input);
                // Return mock data
                return {
                    Items: [orderData],
                };
            });
            // Execute
            const result = await repository.findByUserId('user-123');
            // Verify
            expect(result).toHaveLength(1);
            expect(result[0].userId).toBe('user-123');
            expect(result[0].orderId.value).toBe(mockOrder.orderId.value);
        });
        test('should return empty array when no orders found', async () => {
            // Mock DynamoDB returning no items
            ddbMock.onAnyCommand().resolves({
                Items: [],
            });
            // Execute
            const result = await repository.findByUserId('non-existent-user');
            // Verify
            expect(result).toEqual([]);
        });
        test('should throw error when DynamoDB query fails', async () => {
            // Mock DynamoDB error
            ddbMock.on(client_dynamodb_1.QueryCommand).rejects(new Error('DynamoDB query failed'));
            // Execute and expect error
            await expect(repository.findByUserId('user-123')).rejects.toThrow('Failed to query orders');
        });
    });
});
