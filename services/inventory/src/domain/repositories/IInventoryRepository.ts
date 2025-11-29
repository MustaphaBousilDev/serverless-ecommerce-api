import { InventoryItem } from '../entities/InventoryItem';
import { Reservation } from '../entities/Reservation';

export interface IInventoryRepository {
  findByProductId(productId: string): Promise<InventoryItem | null>;
  save(item: InventoryItem): Promise<void>;
  update(item: InventoryItem): Promise<void>;
  createReservation(reservation: Reservation): Promise<void>;
  getReservation(reservationId: string): Promise<Reservation | null>;
  getReservationByOrderId(orderId: string): Promise<Reservation | null>;
  updateReservation(reservation: Reservation): Promise<void>;
}
