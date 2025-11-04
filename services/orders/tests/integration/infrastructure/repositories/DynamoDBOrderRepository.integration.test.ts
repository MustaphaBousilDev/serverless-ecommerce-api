import { DynamoDBOrderRepository } from '../../../../src/infrastructure/repositories/DynamoDBOrderRepository'; 
import { Order } from '../../../../src/domain/entities/Order';
import { OrderItem } from '../../../../src/domain/entities/OrderItem';
import { Address } from '../../../../src/domain/value-objects/Address';
import { OrderId } from '../../../../src/domain/value-objects/OrderId';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { QueryCommand } from '@aws-sdk/client-dynamodb';

// Mock DynamoDBClient
const ddbMock = mockClient(DynamoDBDocumentClient)

describe('DynamoDBOrderRepository - Integration Tests (Mocked)', () => {
    let repository: DynamoDBOrderRepository
    let mockOrder: Order

    beforeAll(()=> {
        process.env.ORDER_TABLE_NAME = 'dev-orders'
        process.env.AWS_REGION = 'us-east-1'
    })

    beforeEach(() => {
        //reset all mocks before each test
        ddbMock.reset()

        //Create repository
        repository = new DynamoDBOrderRepository()

        //Create mock order
        const items = [
            new OrderItem({
                productId: 'prod-001',
                productName: 'LapTop',
                quantity: 1,
                unitPrice: 999.99
            })
        ]
        const address = new Address({
            street: '13 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001'
        })

        mockOrder = Order.create('user-123', items, address)
    })

    describe('save() method' , ()=> {
        test('should successfully save order to DynamoDB', async () => {
            //Mock successfully DynamoDB put
            ddbMock.on(PutCommand).resolves({})
            //Execute
            await repository.save(mockOrder)
            //Verify PutCommand was called
            const calls = ddbMock.commandCalls(PutCommand);
            expect(calls.length).toBe(1)

            //Verify Correct Paramerts
            const putCall = calls[0]
            expect(putCall.args[0].input.TableName).toBe('dev-orders')
            expect(putCall.args[0].input.Item?.orderId).toBe(mockOrder.orderId.value)
            expect(putCall.args[0].input.Item?.userId).toBe('user-123');
            expect(putCall.args[0].input.Item?.status).toBe('PENDING');
            expect(putCall.args[0].input.Item?.totalAmount).toBe(999.99);
        })

        test('should throw error when DynamoDB save fails ', async () => {
            //Mock dynamoDB Error
            ddbMock.on(PutCommand).rejects(new Error('DynamoDB is unavailable'))
            //execute and expect error
            await expect(repository.save(mockOrder)).rejects.toThrow('Failed to save order')
        })
    })

    describe('findById() method', ()=> {
        test('should find order by ID', async ()=> {
            const orderData = mockOrder.toObject()
            //Mock DynamoDB get returning order
            ddbMock.on(GetCommand).resolves({
                Item: orderData
            })
            //execute
            const result = await repository.findById(mockOrder.orderId)
            //verify
            expect(result).not.toBeNull()
            expect(result?.orderId.value).toBe(mockOrder.orderId.value)
            expect(result?.userId).toBe('user-123');
            expect(result?.status).toBe('PENDING');
            //Verify GetCommand was called correctly
            const calls = ddbMock.commandCalls(GetCommand);
            expect(calls.length).toBe(1);
            expect(calls[0].args[0].input.TableName).toBe('dev-orders');
            expect(calls[0].args[0].input.Key?.orderId).toBe(mockOrder.orderId.value);
        })

        test('should return null when order not found', async () => {
            // Mock DynamoDB returning no item
            ddbMock.on(GetCommand).resolves({})
            //execite resule 
            const result = await repository.findById(new OrderId('non-existent-id'))
            //Verify 
            expect(result).toBeNull()
        })

        test('should return error when DynamoDB Get Fails', async  ()=> {
            ddbMock.on(GetCommand).rejects(new Error('DynamoDB read error'))
            //execute and expected Error
            await expect(repository.findById(mockOrder.orderId)).rejects.toThrow('Failed to get order')
        })
    })

    describe('update() method', ()=> {
        test('should successfully update order in DynamoDB ', async ()=> {
            //Modify Order
            mockOrder.confirm()

            // Mock Successfully DynamoDB update
            ddbMock.on(UpdateCommand).resolves({})

            // Execute
            await repository.update(mockOrder)

            //Verify Update Command was called
            const calls = ddbMock.commandCalls(UpdateCommand)
            expect(calls.length).toBe(1)

            //Verify Correct parameters
            const updateCall = calls[0]
            expect(updateCall.args[0].input.TableName).toBe('dev-orders');
            expect(updateCall.args[0].input.Key?.orderId).toBe(mockOrder.orderId.value);
            expect(updateCall.args[0].input.ExpressionAttributeValues?.[':status']).toBe('CONFIRMED');
        })

        test('should throw error when DynamoDB update fails', async () => {
            // Modify order
            mockOrder.confirm();

            //Mock DynamoDB Error
            ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB update failed'))

            // Execute and expect error
            await expect(repository.update(mockOrder)).rejects.toThrow('Failed to update order');
         })
    })

    describe('delete() method', () => {
        test('should successfully delete order from DynamoDB', async () => {
            // Mock successful DynamoDB delete
            ddbMock.on(DeleteCommand).resolves({});
            
            // Execute
            await repository.delete(mockOrder.orderId);

            // Verify DeleteCommand was called
            const calls = ddbMock.commandCalls(DeleteCommand);
            expect(calls.length).toBe(1);

            // Verify correct parameters
            const deleteCall = calls[0];
            expect(deleteCall.args[0].input.TableName).toBe('dev-orders');
            expect(deleteCall.args[0].input.Key?.orderId).toBe(mockOrder.orderId.value);
        })

        test('should throw error when DynamoDB delete fails', async () => {
            ddbMock.on(DeleteCommand).rejects(new Error('DynamoDB delete failed'));
            await expect(repository.delete(mockOrder.orderId)).rejects.toThrow('Failed to delete order');
        })
    })

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
            
        })
        test('should return empty array when no orders found', async () => {
            // Mock DynamoDB returning no items
            ddbMock.onAnyCommand().resolves({
                Items: [],
            });
            // Execute
            const result = await repository.findByUserId('non-existent-user');
            // Verify
            expect(result).toEqual([]);
        })

        test('should throw error when DynamoDB query fails', async () => {
            // Mock DynamoDB error
            ddbMock.on(QueryCommand).rejects(new Error('DynamoDB query failed'));
            // Execute and expect error
            await expect(repository.findByUserId('user-123')).rejects.toThrow('Failed to query orders');
        })
    })
})