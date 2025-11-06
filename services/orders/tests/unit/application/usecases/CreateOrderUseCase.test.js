"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CreateOrderUseCase_1 = require("../../../../src/application/usecases/CreateOrderUseCase");
class MockOrderRepository {
    constructor() {
        this.orders = [];
    }
    async save(order) {
        this.orders.push(order);
    }
    async findById(orderId) {
        return this.orders.find((o) => o.orderId.value === orderId.value) || null;
    }
    async findByUserId(userId) {
        return this.orders.filter((o) => o.userId === userId);
    }
    async update(order) {
        const index = this.orders.findIndex((o) => o.orderId.equals(order.orderId));
        if (index !== -1) {
            this.orders[index] = order;
        }
    }
    async delete(orderId) {
        this.orders = this.orders.filter((o) => !o.orderId.equals(orderId));
    }
    getAll() {
        return this.orders;
    }
}
describe('CreateOrderUseCase', () => {
    let useCase;
    let mockRepository;
    const validInput = {
        userId: 'user-123',
        items: [
            {
                productId: 'prod-001',
                productName: 'Laptop',
                quantity: 1,
                unitPrice: 999.99,
            },
        ],
        shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001',
        },
    };
    beforeEach(() => {
        mockRepository = new MockOrderRepository();
        useCase = new CreateOrderUseCase_1.CreateOrderUseCase(mockRepository);
    });
    describe('Successful Order Creation', () => {
        test('should create order with valid input', async () => {
            const result = await useCase.execute(validInput);
            expect(result.orderId).toBeDefined();
            expect(result.userId).toBe('user-123');
            expect(result.status).toBe('PENDING');
            expect(result.totalAmount).toBe(999.99);
            expect(result.createdAt).toBeDefined();
        });
        test('should save order to repository', async () => {
            await useCase.execute(validInput);
            const orders = mockRepository.getAll();
            expect(orders).toHaveLength(1);
            expect(orders[0].userId).toBe('user-123');
        });
        test('should calculate total correctly with multiple items', async () => {
            const input = {
                ...validInput,
                items: [
                    {
                        productId: 'prod-001',
                        productName: 'Laptop',
                        quantity: 2,
                        unitPrice: 999.99,
                    },
                    {
                        productId: 'prod-002',
                        productName: 'Mouse',
                        quantity: 1,
                        unitPrice: 29.99,
                    },
                ],
            };
            const result = await useCase.execute(input);
            expect(result.totalAmount).toBe(2029.97);
        });
    });
    describe('Validation Errors', () => {
        test('should throw error when userId is missing', async () => {
            const input = { ...validInput, userId: '' };
            await expect(useCase.execute(input)).rejects.toThrow('userId is required');
        });
        test('should throw error when items array is empty', async () => {
            const input = { ...validInput, items: [] };
            await expect(useCase.execute(input)).rejects.toThrow('items are required');
        });
        test('should throw error when shippingAddress is missing', async () => {
            const input = { ...validInput, shippingAddress: null };
            await expect(useCase.execute(input)).rejects.toThrow('shippingAddress is required');
        });
    });
});
