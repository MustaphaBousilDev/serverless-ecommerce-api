import { Order, OrderStatus } from '../../../../src/domain/entities/Order';
import { OrderItem } from '../../../../src/domain/entities/OrderItem';
import { Address } from '../../../../src/domain/value-objects/Address';
import { OrderId } from '../../../../src/domain/value-objects/OrderId';

describe('Order Entity', ()=> {
   // Test Data Setup
   const mockItems = [
    new OrderItem({
        productId: 'prod-001',
        productName: 'LapTop',
        quantity: 1,
        unitPrice: 999.99
    })
   ]

   const mockAddress = new Address({
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    zipCode: '10001',
   })


   describe('Order Creation', () => {
    test('should create an order with valid data', () => {
      const order = Order.create('user-123', mockItems, mockAddress);

      expect(order.userId).toBe('user-123');
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.totalAmount).toBe(999.99);
      expect(order.items).toHaveLength(1);
      expect(order.shippingAddress).toBe(mockAddress);
      expect(order.orderId).toBeInstanceOf(OrderId);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    test('should calculate total amount correctly with multiple items', () => {
      const multipleItems = [
        new OrderItem({
          productId: 'prod-001',
          productName: 'Laptop',
          quantity: 2,
          unitPrice: 999.99,
        }),
        new OrderItem({
          productId: 'prod-002',
          productName: 'Mouse',
          quantity: 1,
          unitPrice: 29.99,
        }),
      ];

      const order = Order.create('user-123', multipleItems, mockAddress);

      expect(order.totalAmount).toBe(2029.97); // (999.99 * 2) + 29.99
    });

    test('should throw error when userId is empty', () => {
      expect(() => {
        Order.create('', mockItems, mockAddress);
      }).toThrow('User ID is required');
    });

    test('should throw error when items array is empty', () => {
      expect(() => {
        Order.create('user-123', [], mockAddress);
      }).toThrow('Order must have at least one item');
    });
})

describe('Order Status Updates', () => {
    test('should confirm order when status is PENDING', () => {
      const order = Order.create('user-123', mockItems, mockAddress);
      const beforeUpdate = order.updatedAt;

      // Wait a tiny bit to ensure updatedAt changes
      order.confirm();

      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(order.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    test('should not confirm order when status is not PENDING', () => {
      const order = Order.create('user-123', mockItems, mockAddress);
      order.confirm();

      expect(() => {
        order.confirm();
      }).toThrow('Only pending orders can be confirmed');
    });

    test('should ship order when status is CONFIRMED', () => {
      const order = Order.create('user-123', mockItems, mockAddress);
      order.confirm();

      order.ship();

      expect(order.status).toBe(OrderStatus.SHIPPED);
    });

    test('should not ship order when status is PENDING', () => {
      const order = Order.create('user-123', mockItems, mockAddress);

      expect(() => {
        order.ship();
      }).toThrow('Only confirmed or processing orders can be shipped');
    });

    test('should cancel order when status is not DELIVERED', () => {
      const order = Order.create('user-123', mockItems, mockAddress);

      order.cancel();

      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    test('should not cancel already cancelled order', () => {
      const order = Order.create('user-123', mockItems, mockAddress);
      order.cancel();

      expect(() => {
        order.cancel();
      }).toThrow('Order is already cancelled');
    });
  });

  describe('Order Serialization', () => {
    test('should convert order to plain object', () => {
      const order = Order.create('user-123', mockItems, mockAddress);
      const orderObject = order.toObject();

      expect(orderObject).toHaveProperty('orderId');
      expect(orderObject).toHaveProperty('userId');
      expect(orderObject).toHaveProperty('items');
      expect(orderObject).toHaveProperty('shippingAddress');
      expect(orderObject).toHaveProperty('status');
      expect(orderObject).toHaveProperty('totalAmount');
      expect(orderObject).toHaveProperty('createdAt');
      expect(orderObject).toHaveProperty('updatedAt');
      expect(typeof orderObject.orderId).toBe('string');
      expect(typeof orderObject.createdAt).toBe('string');
    });

    test('should reconstruct order from plain object', () => {
      const order = Order.create('user-123', mockItems, mockAddress);
      const orderObject = order.toObject();

      const reconstructedOrder = Order.fromObject(orderObject);

      expect(reconstructedOrder.orderId.value).toBe(order.orderId.value);
      expect(reconstructedOrder.userId).toBe(order.userId);
      expect(reconstructedOrder.status).toBe(order.status);
      expect(reconstructedOrder.totalAmount).toBe(order.totalAmount);
    });
  });

  describe('Order Getters', () => {
    test('should return immutable items array', () => {
      const order = Order.create('user-123', mockItems, mockAddress);
      const items = order.items;

      // Modify the returned array
      items.push(
        new OrderItem({
          productId: 'prod-999',
          productName: 'Fake',
          quantity: 1,
          unitPrice: 1,
        })
      );

      // Original order should still have only 1 item
      expect(order.items).toHaveLength(1);
    });
  });
});