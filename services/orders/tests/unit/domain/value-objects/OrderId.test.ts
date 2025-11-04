// tests/unit/domain/value-objects/OrderId.test.ts

import { OrderId } from '../../../../src/domain/value-objects/OrderId';

describe('OrderId Value Object', () => {
  describe('OrderId Creation', () => {
    test('should create OrderId with valid UUID', () => {
      const id = new OrderId('550e8400-e29b-41d4-a716-446655440000');

      expect(id.value).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    test('should throw error when value is empty', () => {
      expect(() => {
        new OrderId('');
      }).toThrow('OrderId cannot be empty');
    });

    test('should throw error when value is whitespace', () => {
      expect(() => {
        new OrderId('   ');
      }).toThrow('OrderId cannot be empty');
    });
  });

  describe('OrderId Generation', () => {
    test('should generate unique OrderId', () => {
      const id1 = OrderId.generate();
      const id2 = OrderId.generate();

      expect(id1.value).not.toBe(id2.value);
    });

    test('should generate valid UUID format', () => {
      const id = OrderId.generate();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(id.value).toMatch(uuidRegex);
    });
  });

  describe('OrderId Equality', () => {
    test('should return true for equal OrderIds', () => {
      const id1 = new OrderId('550e8400-e29b-41d4-a716-446655440000');
      const id2 = new OrderId('550e8400-e29b-41d4-a716-446655440000');

      expect(id1.equals(id2)).toBe(true);
    });

    test('should return false for different OrderIds', () => {
      const id1 = new OrderId('550e8400-e29b-41d4-a716-446655440000');
      const id2 = new OrderId('660e8400-e29b-41d4-a716-446655440000');

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('OrderId String Conversion', () => {
    test('should convert to string', () => {
      const id = new OrderId('550e8400-e29b-41d4-a716-446655440000');

      expect(id.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });
});