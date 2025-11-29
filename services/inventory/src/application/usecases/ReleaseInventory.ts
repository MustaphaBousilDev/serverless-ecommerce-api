import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';
import { IEventPublisher } from '../../domain/events/IEventPublisher';
import { ReservationStatus } from '../../domain/entities/Reservation';

export class ReleaseInventory {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(input: {
    orderId: string;
    reason: string;
    correlationId: string;
  }): Promise<void> {
    // Find reservation
    const reservation = await this.inventoryRepository.getReservationByOrderId(input.orderId);

    if (!reservation) {
      throw new Error(`No reservation found for order ${input.orderId}`);
    }

    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new Error(`Cannot release reservation with status ${reservation.status}`);
    }

    // Release inventory for all items
    for (const item of reservation.items) {
      const inventoryItem = await this.inventoryRepository.findByProductId(item.productId);

      if (!inventoryItem) {
        throw new Error(`Product ${item.productId} not found`);
      }

      inventoryItem.release(item.quantity);
      await this.inventoryRepository.update(inventoryItem);
    }

    // Update reservation status
    reservation.release();
    await this.inventoryRepository.updateReservation(reservation);

    // Publish event
    await this.eventPublisher.publishInventoryReleased({
      reservationId: reservation.reservationId,
      orderId: input.orderId,
      reason: input.reason,
    });
  }
}
