"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateOrderUseCase_1 = require("../../../../src/application/usecases/UpdateOrderUseCase");
const Order_1 = require("../../../../src/domain/entities/Order");
const OrderItem_1 = require("../../../../src/domain/entities/OrderItem");
const Address_1 = require("../../../../src/domain/value-objects/Address");
class MockOrderRepository {
    constructor() {
        this.orders = new Map();
    }
    async save(order) {
        this.orders.set(order.orderId.value, order);
    }
    async findById(orderId) {
        return this.orders.get(orderId.value) || null;
    }
    async findByUserId(userId) {
        return Array.from(this.orders.values()).filter((o) => o.userId === userId);
    }
    async update(order) {
        this.orders.set(order.orderId.value, order);
    }
    async delete(orderId) {
        this.orders.delete(orderId.value);
    }
}
describe('UpdateOrderStatusUseCase', () => {
    let useCase;
    let mockRepository;
    let testOrder;
    beforeEach(() => {
        mockRepository = new MockOrderRepository();
        useCase = new UpdateOrderUseCase_1.UpdateOrderStatusUseCase(mockRepository);
        // Create test order
        const items = [
            new OrderItem_1.OrderItem({
                productId: 'prod-001',
                productName: 'Laptop',
                quantity: 1,
                unitPrice: 999.99,
            }),
        ];
        const address = new Address_1.Address({
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001',
        });
        testOrder = Order_1.Order.create('user-123', items, address);
        mockRepository.save(testOrder);
    });
    describe('Successful Status Updates', () => {
        test('should update status to CONFIRMED', async () => {
            const result = await useCase.execute({
                orderId: testOrder.orderId.value,
                status: Order_1.OrderStatus.CONFIRMED,
            });
            expect(result.orderId).toBe(testOrder.orderId.value);
            expect(result.status).toBe(Order_1.OrderStatus.CONFIRMED);
            expect(result.updatedAt).toBeDefined();
        });
        test('should update status to SHIPPED after CONFIRMED', async () => {
            // First confirm
            await useCase.execute({
                orderId: testOrder.orderId.value,
                status: Order_1.OrderStatus.CONFIRMED,
            });
            // Then ship
            const result = await useCase.execute({
                orderId: testOrder.orderId.value,
                status: Order_1.OrderStatus.SHIPPED,
            });
            expect(result.status).toBe(Order_1.OrderStatus.SHIPPED);
        });
        test('should update status to CANCELLED', async () => {
            const result = await useCase.execute({
                orderId: testOrder.orderId.value,
                status: Order_1.OrderStatus.CANCELLED,
            });
            expect(result.status).toBe(Order_1.OrderStatus.CANCELLED);
        });
    });
    describe('Validation Errors', () => {
        test('should throw error when orderId is missing', async () => {
            await expect(useCase.execute({
                orderId: '',
                status: Order_1.OrderStatus.CONFIRMED,
            })).rejects.toThrow('orderId is required');
        });
        test('should throw error when status is missing', async () => {
            await expect(useCase.execute({
                orderId: testOrder.orderId.value,
                status: null,
            })).rejects.toThrow('status is required');
        });
        test('should throw error when order not found', async () => {
            await expect(useCase.execute({
                orderId: 'non-existent-id',
                status: Order_1.OrderStatus.CONFIRMED,
            })).rejects.toThrow('Order not found');
        });
    });
    describe('Business Rule Violations', () => {
        test('should throw error when trying to confirm already confirmed order', async () => {
            // First confirmation
            await useCase.execute({
                orderId: testOrder.orderId.value,
                status: Order_1.OrderStatus.CONFIRMED,
            });
            // Second confirmation should fail
            await expect(useCase.execute({
                orderId: testOrder.orderId.value,
                status: Order_1.OrderStatus.CONFIRMED,
            })).rejects.toThrow('Only pending orders can be confirmed');
        });
        test('should throw error when trying to ship pending order', async () => {
            await expect(useCase.execute({
                orderId: testOrder.orderId.value,
                status: Order_1.OrderStatus.SHIPPED,
            })).rejects.toThrow('Only confirmed or processing orders can be shipped');
        });
    });
});
