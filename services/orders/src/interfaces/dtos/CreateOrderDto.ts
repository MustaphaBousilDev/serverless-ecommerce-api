export interface CreateOrderRequestDto {
  items: OrderItemDto[];
  shippingAddress: AddressDto;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface CreateOrderResponseDto {
  success: boolean;
  data: {
    orderId: string;
    userId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  };
  message: string;
}