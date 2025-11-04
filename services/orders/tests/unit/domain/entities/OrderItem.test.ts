// tests/unit/domain/entities/OrderItem.test.ts

import { OrderItem } from '../../../../src/domain/entities/OrderItem';

describe('OrderItem Entity', () => {
  describe('OrderItem Creation', () => {
    test('should create order item with valid data', () => {
      const item = new OrderItem({
        productId: 'prod-001',
        productName: 'Laptop',
        quantity: 2,
        unitPrice: 999.99,
      });

      expect(item.productId).toBe('prod-001');
      expect(item.productName).toBe('Laptop');
      expect(item.quantity).toBe(2);
      expect(item.unitPrice).toBe(999.99);
    });

    test('should throw error when productId is empty', () => {
      expect(() => {
        new OrderItem({
          productId: '',
          productName: 'Laptop',
          quantity: 1,
          unitPrice: 999.99,
        });
      }).toThrow('Product ID is required');
    });

    test('should throw error when productName is empty', () => {
      expect(() => {
        new OrderItem({
          productId: 'prod-001',
          productName: '',
          quantity: 1,
          unitPrice: 999.99,
        });
      }).toThrow('Product name is required');
    });

    test('should throw error when quantity is zero', () => {
      expect(() => {
        new OrderItem({
          productId: 'prod-001',
          productName: 'Laptop',
          quantity: 0,
          unitPrice: 999.99,
        });
      }).toThrow('Quantity must be greater than zero');
    });

    test('should throw error when quantity is negative', () => {
      expect(() => {
        new OrderItem({
          productId: 'prod-001',
          productName: 'Laptop',
          quantity: -1,
          unitPrice: 999.99,
        });
      }).toThrow('Quantity must be greater than zero');
    });

    test('should throw error when unitPrice is zero', () => {
      expect(() => {
        new OrderItem({
          productId: 'prod-001',
          productName: 'Laptop',
          quantity: 1,
          unitPrice: 0,
        });
      }).toThrow('Unit price must be greater than zero');
    });
  });

  describe('OrderItem Calculations', () => {
    test('should calculate total price correctly', () => {
      const item = new OrderItem({
        productId: 'prod-001',
        productName: 'Laptop',
        quantity: 3,
        unitPrice: 999.99,
      });

      expect(item.getTotalPrice()).toBe(2999.9700000000003);
    });

    test('should handle decimal precision', () => {
      const item = new OrderItem({
        productId: 'prod-001',
        productName: 'Item',
        quantity: 3,
        unitPrice: 10.33,
      });

      expect(item.getTotalPrice()).toBeCloseTo(30.99, 2);
    });
  });

  describe('OrderItem Serialization', () => {
    test('should convert to plain object', () => {
      const item = new OrderItem({
        productId: 'prod-001',
        productName: 'Laptop',
        quantity: 2,
        unitPrice: 999.99,
      });

      const obj = item.toObject();

      expect(obj).toEqual({
        productId: 'prod-001',
        productName: 'Laptop',
        quantity: 2,
        unitPrice: 999.99,
      });
    });

    test('should reconstruct from plain object', () => {
      const obj = {
        productId: 'prod-001',
        productName: 'Laptop',
        quantity: 2,
        unitPrice: 999.99,
      };

      const item = OrderItem.fromObject(obj);

      expect(item.productId).toBe('prod-001');
      expect(item.productName).toBe('Laptop');
      expect(item.quantity).toBe(2);
      expect(item.unitPrice).toBe(999.99);
    });
  });
});