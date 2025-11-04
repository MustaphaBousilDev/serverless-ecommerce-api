import { DeleteOrderUseCase } from '../../../../src/application/usecases/DeleteOrderUseCase';
import { IOrderRepository } from '../../../../src/domain/repositories/IOrderRepository';
import { Order } from '../../../../src/domain/entities/Order';
import { OrderItem } from '../../../../src/domain/entities/OrderItem';
import { Address } from '../../../../src/domain/value-objects/Address';
import { OrderId } from '../../../../src/domain/value-objects/OrderId';

class MockOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    this.orders.set(order.orderId.value, order);
  }

  async findById(orderId: OrderId): Promise<Order | null> {
    return this.orders.get(orderId.value) || null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => o.userId === userId);
  }

  async update(order: Order): Promise<void> {
    this.orders.set(order.orderId.value, order);
  }

  async delete(orderId: OrderId): Promise<void> {
    this.orders.delete(orderId.value);
  }

  has(orderId: string): boolean {
    return this.orders.has(orderId);
  }
}

describe('DeleteOrderUseCase', () => {
  let useCase: DeleteOrderUseCase;
  let mockRepository: MockOrderRepository;
  let testOrder: Order;

  beforeEach(() => {
    mockRepository = new MockOrderRepository();
    useCase = new DeleteOrderUseCase(mockRepository);

    // Create test order
    const items = [
      new OrderItem({
        productId: 'prod-001',
        productName: 'Laptop',
        quantity: 1,
        unitPrice: 999.99,
      }),
    ];

    const address = new Address({
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001',
    });

    testOrder = Order.create('user-123', items, address);
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
      await expect(
        useCase.execute({ orderId: '' })
      ).rejects.toThrow('orderId is required');
    });

    test('should throw error when order not found', async () => {
      await expect(
        useCase.execute({ orderId: 'non-existent-id' })
      ).rejects.toThrow('Order not found');
    });
  });

  describe('Business Rule Protection', () => {
    test('should not delete confirmed order', async () => {
      testOrder.confirm();
      await mockRepository.update(testOrder);

      await expect(
        useCase.execute({ orderId: testOrder.orderId.value })
      ).rejects.toThrow('Cannot delete order with status: CONFIRMED');
    });

    test('should not delete shipped order', async () => {
      testOrder.confirm();
      testOrder.ship();
      await mockRepository.update(testOrder);

      await expect(
        useCase.execute({ orderId: testOrder.orderId.value })
      ).rejects.toThrow('Cannot delete order with status: SHIPPED');
    });
  });
});