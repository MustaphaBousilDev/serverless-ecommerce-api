import { UpdateOrderStatusUseCase } from '../../../../src/application/usecases/UpdateOrderUseCase';
import { IOrderRepository } from '../../../../src/domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '../../../../src/domain/entities/Order';
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
}

describe('UpdateOrderStatusUseCase', () => {
  let useCase: UpdateOrderStatusUseCase;
  let mockRepository: MockOrderRepository;
  let testOrder: Order;

  beforeEach(() => {
    mockRepository = new MockOrderRepository();
    useCase = new UpdateOrderStatusUseCase(mockRepository);

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

  describe('Successful Status Updates', () => {
    test('should update status to CONFIRMED', async () => {
      const result = await useCase.execute({
        orderId: testOrder.orderId.value,
        status: OrderStatus.CONFIRMED,
      });

      expect(result.orderId).toBe(testOrder.orderId.value);
      expect(result.status).toBe(OrderStatus.CONFIRMED);
      expect(result.updatedAt).toBeDefined();
    });

    test('should update status to SHIPPED after CONFIRMED', async () => {
      // First confirm
      await useCase.execute({
        orderId: testOrder.orderId.value,
        status: OrderStatus.CONFIRMED,
      });

      // Then ship
      const result = await useCase.execute({
        orderId: testOrder.orderId.value,
        status: OrderStatus.SHIPPED,
      });

      expect(result.status).toBe(OrderStatus.SHIPPED);
    });

    test('should update status to CANCELLED', async () => {
      const result = await useCase.execute({
        orderId: testOrder.orderId.value,
        status: OrderStatus.CANCELLED,
      });

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('Validation Errors', () => {
    test('should throw error when orderId is missing', async () => {
      await expect(
        useCase.execute({
          orderId: '',
          status: OrderStatus.CONFIRMED,
        })
      ).rejects.toThrow('orderId is required');
    });

    test('should throw error when status is missing', async () => {
      await expect(
        useCase.execute({
          orderId: testOrder.orderId.value,
          status: null as any,
        })
      ).rejects.toThrow('status is required');
    });

    test('should throw error when order not found', async () => {
      await expect(
        useCase.execute({
          orderId: 'non-existent-id',
          status: OrderStatus.CONFIRMED,
        })
      ).rejects.toThrow('Order not found');
    });
  });

  describe('Business Rule Violations', () => {
    test('should throw error when trying to confirm already confirmed order', async () => {
      // First confirmation
      await useCase.execute({
        orderId: testOrder.orderId.value,
        status: OrderStatus.CONFIRMED,
      });

      // Second confirmation should fail
      await expect(
        useCase.execute({
          orderId: testOrder.orderId.value,
          status: OrderStatus.CONFIRMED,
        })
      ).rejects.toThrow('Only pending orders can be confirmed');
    });

    test('should throw error when trying to ship pending order', async () => {
      await expect(
        useCase.execute({
          orderId: testOrder.orderId.value,
          status: OrderStatus.SHIPPED,
        })
      ).rejects.toThrow('Only confirmed or processing orders can be shipped');
    });
  });
});