"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeleteOrderUseCase_1 = require("../../../../src/application/usecases/DeleteOrderUseCase");
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
    has(orderId) {
        return this.orders.has(orderId);
    }
}
describe('DeleteOrderUseCase', () => {
    let useCase;
    let mockRepository;
    let testOrder;
    beforeEach(() => {
        mockRepository = new MockOrderRepository();
        useCase = new DeleteOrderUseCase_1.DeleteOrderUseCase(mockRepository);
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
    describe('Successful Deletion', () => {
        test('should delete pending order', async () => {
            const result = await useCase.execute({
                orderId: testOrder.orderId.value,
            });
            expect(result.deleted).toBe(true);
            expect(result.orderId).toBe(testOrder.orderId.value);
            expect(result.message).toBe('Order deleted successfully');
            expect(mockRepository.has(testOrder.orderId.value)).toBe(false);
        });
        test('should delete cancelled order', async () => {
            // Cancel the order first
            testOrder.cancel();
            await mockRepository.update(testOrder);
            const result = await useCase.execute({
                orderId: testOrder.orderId.value,
            });
            expect(result.deleted).toBe(true);
            expect(mockRepository.has(testOrder.orderId.value)).toBe(false);
        });
    });
    describe('Validation Errors', () => {
        test('should throw error when orderId is missing', async () => {
            await expect(useCase.execute({ orderId: '' })).rejects.toThrow('orderId is required');
        });
        test('should throw error when order not found', async () => {
            await expect(useCase.execute({ orderId: 'non-existent-id' })).rejects.toThrow('Order not found');
        });
    });
    describe('Business Rule Protection', () => {
        test('should not delete confirmed order', async () => {
            testOrder.confirm();
            await mockRepository.update(testOrder);
            await expect(useCase.execute({ orderId: testOrder.orderId.value })).rejects.toThrow('Cannot delete order with status: CONFIRMED');
        });
        test('should not delete shipped order', async () => {
            testOrder.confirm();
            testOrder.ship();
            await mockRepository.update(testOrder);
            await expect(useCase.execute({ orderId: testOrder.orderId.value })).rejects.toThrow('Cannot delete order with status: SHIPPED');
        });
    });
});
