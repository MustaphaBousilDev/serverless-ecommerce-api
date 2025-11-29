export interface IEventPublisher {
  publishInventoryReserved(data: {
    reservationId: string;
    orderId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<void>;

  publishInventoryReservationFailed(data: {
    orderId: string;
    reason: string;
  }): Promise<void>;

  publishInventoryReleased(data: {
    reservationId: string;
    orderId: string;
    reason: string;
  }): Promise<void>;
}
