"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OrderValidator_1 = require("../../../../src/interfaces/validators/OrderValidator");
describe('OrderValidator', () => {
    const validOrderData = {
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
    describe('validateCreateOrder', () => {
        test('should validate correct order data', () => {
            const result = OrderValidator_1.OrderValidator.validateCreateOrder(validOrderData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test('should return error when userId is missing', () => {
            const data = { ...validOrderData, userId: '' };
            const result = OrderValidator_1.OrderValidator.validateCreateOrder(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('userId is required and must be a non-empty string');
        });
        test('should return error when items array is empty', () => {
            const data = { ...validOrderData, items: [] };
            const result = OrderValidator_1.OrderValidator.validateCreateOrder(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('items array is required'))).toBe(true);
        });
        test('should return error when item quantity is zero', () => {
            const data = {
                ...validOrderData,
                items: [{ ...validOrderData.items[0], quantity: 0 }],
            };
            const result = OrderValidator_1.OrderValidator.validateCreateOrder(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('quantity must be a positive number'))).toBe(true);
        });
        test('should return error when shippingAddress is missing', () => {
            const data = { ...validOrderData, shippingAddress: null };
            const result = OrderValidator_1.OrderValidator.validateCreateOrder(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('shippingAddress is required'))).toBe(true);
        });
        test('should return multiple errors for multiple issues', () => {
            const data = {
                userId: '',
                items: [],
                shippingAddress: null,
            };
            const result = OrderValidator_1.OrderValidator.validateCreateOrder(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(2);
        });
    });
    describe('validateGetOrder', () => {
        test('should validate correct orderId', () => {
            const result = OrderValidator_1.OrderValidator.validateGetOrder('550e8400-e29b-41d4-a716-446655440000');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test('should return error when orderId is empty', () => {
            const result = OrderValidator_1.OrderValidator.validateGetOrder('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('orderId is required and must be a non-empty string');
        });
    });
    describe('validateListOrders', () => {
        test('should validate correct userId', () => {
            const result = OrderValidator_1.OrderValidator.validateListOrders('user-123');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        test('should return error when userId is empty', () => {
            const result = OrderValidator_1.OrderValidator.validateListOrders('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('userId is required and must be a non-empty string');
        });
    });
});
