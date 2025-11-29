export enum SagaEventType {
    ORDER_CREATED = 'OrderCreated',
    ORDER_CONFIRMED = 'OrderConfirmed',
    ORDER_CANCELLED = 'OrderCancelled',
    ORDER_FAILED = 'OrderFailed',

    INVENTORY_RESERVED = 'InventoryReserved',
    INVENTORY_RESERVATION_FAILED = 'InventoryReservationFailed',
    INVENTORY_RELEASED = 'InventoryReleased',

    PAYMENT_AUTHORIZED = 'PaymentAuthorized',
    PAYMENT_AUTHORIZATION_FAILED = 'PaymentAuthorizationFailed',
    PAYMENT_CHARGED = 'PaymentCharged',
    PAYMENT_CHARGE_FAILED = 'PaymentChargeFailed',
    PAYMENT_REFUNDED = 'PaymentRefunded',

    EMAIL_SENT = 'EmailSent',
    EMAIL_FAILED = 'EmailFailed',
}

export interface SagaEvent {
  sagaId: string;           
  correlationId: string;    
  eventType: SagaEventType;
  timestamp: string;
  payload: any;
  metadata: {
    serviceName: string;
    stepNumber: number;
    isCompensation: boolean;
  };
}

export interface OrderSagaData {
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  shippingAddress: any;
}

export interface InventorySagaData {
  orderId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  reservationId?: string;
}

export interface PaymentSagaData {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  authorizationId?: string;
}