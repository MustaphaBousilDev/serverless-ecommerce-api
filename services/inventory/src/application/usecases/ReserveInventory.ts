import { InventoryItem } from '../../domain/entities/InventoryItem';
import { Reservation } from '../../domain/entities/Reservation';
import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';
import { IEventPublisher } from '../../domain/events/IEventPublisher';

export class ReserveInventory {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(input: {
    orderId: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    correlationId: string;
  }): Promise<Reservation> {
    // Check if all items have sufficient stock
    const inventoryItems: InventoryItem[] = [];

    for (const item of input.items) {
      const inventoryItem = await this.inventoryRepository.findByProductId(item.productId);

      if (!inventoryItem) {
        throw new Error(`Product ${item.productId} not found in inventory`);
      }

      if (!inventoryItem.isAvailable(item.quantity)) {
        throw new Error(
          `Insufficient stock for product ${item.productId}. Available: ${inventoryItem.availableQuantity}, Requested: ${item.quantity}`
        );
      }

      inventoryItems.push(inventoryItem);
    }

    // Reserve all items
    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      const inventoryItem = inventoryItems[i];

      inventoryItem.reserve(item.quantity);
      await this.inventoryRepository.update(inventoryItem);
    }

    // Create reservation record
    const reservation = Reservation.create(input.orderId, input.items);
    await this.inventoryRepository.createReservation(reservation);

    // Publish event
    await this.eventPublisher.publishInventoryReserved({
      reservationId: reservation.reservationId,
      orderId: input.orderId,
      items: input.items,
    });

    return reservation;
  }
}
