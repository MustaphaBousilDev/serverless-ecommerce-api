
export interface GetOrderRequestDto {
  orderId: string;
}

export interface GetOrderResponseDto {
  success: boolean;
  data: {
    orderId: string;
    userId: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    status: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}