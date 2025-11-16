export enum OrderStatusEnum {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export class OrderStatus {
    private readonly _value: OrderStatusEnum;

    private constructor(value: OrderStatusEnum) {
        this._value = value;
    }

    static create(value: string): OrderStatus {
       const upperValue = value.toUpperCase()
       if(!Object.values(OrderStatus).includes(upperValue as OrderStatusEnum)){
          throw new Error(`Invalid order status: ${value}`);
       }
       return new OrderStatus(upperValue as OrderStatusEnum)
    }

    static pending(): OrderStatus {
        return new OrderStatus(OrderStatusEnum.PENDING)
    }

    static confirmed(): OrderStatus {
        return new OrderStatus(OrderStatusEnum.CONFIRMED);
    }

    static processing(): OrderStatus {
        return new OrderStatus(OrderStatusEnum.PROCESSING);
    }

    static shipped(): OrderStatus {
        return new OrderStatus(OrderStatusEnum.SHIPPED);
    }

    static delivered(): OrderStatus {
        return new OrderStatus(OrderStatusEnum.DELIVERED);
    }

    static cancelled(): OrderStatus {
        return new OrderStatus(OrderStatusEnum.CANCELLED);
    }

    get value(): string {
        return this._value;
    }

    canBeCancelled(): boolean {
        return this._value === OrderStatusEnum.PENDING || 
            this._value === OrderStatusEnum.CONFIRMED;
    }

    canUpdateItems(): boolean {
        return this._value === OrderStatusEnum.PENDING;
    }

    equals(other: OrderStatus): boolean {
        return this._value === other._value;
    }

    isPending(): boolean {
        return this._value === OrderStatusEnum.PENDING;
    }

    isShipped(): boolean {
        return this._value === OrderStatusEnum.SHIPPED;
    }

    isCancelled(): boolean {
        return this._value === OrderStatusEnum.CANCELLED;
    }
}