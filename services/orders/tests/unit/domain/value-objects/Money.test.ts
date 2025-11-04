// tests/unit/domain/value-objects/Money.test.ts

import { Money } from '../../../../src/domain/value-objects/Money';

describe('Money Value Object', () => {
  describe('Money Creation', () => {
    test('should create money with valid amount', () => {
      const money = new Money(100, 'USD');

      expect(money.amount).toBe(100);
      expect(money.currency).toBe('USD');
    });

    test('should use USD as default currency', () => {
      const money = new Money(100);

      expect(money.currency).toBe('USD');
    });

    test('should throw error when amount is negative', () => {
      expect(() => {
        new Money(-10, 'USD');
      }).toThrow('Amount cannot be negative');
    });

    test('should allow zero amount', () => {
      const money = new Money(0, 'USD');

      expect(money.amount).toBe(0);
    });
  });

  describe('Money Operations', () => {
    test('should add money with same currency', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(50, 'USD');

      const result = money1.add(money2);

      expect(result.amount).toBe(150);
      expect(result.currency).toBe('USD');
    });

    test('should throw error when adding different currencies', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(50, 'EUR');

      expect(() => {
        money1.add(money2);
      }).toThrow('Cannot add money with different currencies');
    });

    test('should multiply money by factor', () => {
      const money = new Money(100, 'USD');

      const result = money.multiply(3);

      expect(result.amount).toBe(300);
      expect(result.currency).toBe('USD');
    });

    test('should handle decimal multiplication', () => {
      const money = new Money(100, 'USD');

      const result = money.multiply(1.5);

      expect(result.amount).toBe(150);
    });
  });

  describe('Money Serialization', () => {
    test('should convert to plain object', () => {
      const money = new Money(100, 'USD');
      const obj = money.toObject();

      expect(obj).toEqual({
        amount: 100,
        currency: 'USD',
      });
    });

    test('should reconstruct from plain object', () => {
      const obj = { amount: 100, currency: 'EUR' };
      const money = Money.fromObject(obj);

      expect(money.amount).toBe(100);
      expect(money.currency).toBe('EUR');
    });
  });
});