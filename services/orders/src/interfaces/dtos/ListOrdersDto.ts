
export interface ListOrdersRequestDto {
  userId: string;
}

export interface OrderSummaryDto {
  orderId: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface ListOrdersResponseDto {
  success: boolean;
  data: {
    orders: OrderSummaryDto[];
    count: number;
  };
  message: string;
}