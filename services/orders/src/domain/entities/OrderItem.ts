export interface OrderItemProps {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export class OrderItem {
  private props: OrderItemProps;

  constructor(props: OrderItemProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.productId) {
      throw new Error('Product ID is required');
    }

    if (!this.props.productName) {
      throw new Error('Product name is required');
    }

    if (this.props.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    if (this.props.unitPrice <= 0) {
      throw new Error('Unit price must be greater than zero');
    }
  }

  getTotalPrice(): number {
    return this.props.quantity * this.props.unitPrice;
  }

  // Getters
  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  toObject(): any {
    return {
      productId: this.props.productId,
      productName: this.props.productName,
      quantity: this.props.quantity,
      unitPrice: this.props.unitPrice,
    };
  }

  static fromObject(data: any): OrderItem {
    return new OrderItem({
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    });
  }
}