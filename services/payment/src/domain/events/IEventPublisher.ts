export interface IEventPublisher {
  publishPaymentCharged(data: {
    paymentId: string;
    orderId: string;
    amount: number;
    transactionId: string;
  }): Promise<void>;

  publishPaymentFailed(data: {
    orderId: string;
    reason: string;
  }): Promise<void>;
}