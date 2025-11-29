export class InventoryItem {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public availableQuantity: number,
    public reservedQuantity: number,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(productId: string, productName: string, initialQuantity: number): InventoryItem {
    return new InventoryItem(
      productId,
      productName,
      initialQuantity,
      0,
      new Date(),
      new Date()
    );
  }

  static fromObject(data: any): InventoryItem {
    return new InventoryItem(
      data.productId,
      data.productName,
      data.availableQuantity,
      data.reservedQuantity,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  reserve(quantity: number): void {
    if (this.availableQuantity < quantity) {
      throw new Error(`Insufficient inventory. Available: ${this.availableQuantity}, Requested: ${quantity}`);
    }

    this.availableQuantity -= quantity;
    this.reservedQuantity += quantity;
    this.updatedAt = new Date();
  }

  release(quantity: number): void {
    if (this.reservedQuantity < quantity) {
      throw new Error(`Cannot release ${quantity}. Only ${this.reservedQuantity} reserved.`);
    }

    this.reservedQuantity -= quantity;
    this.availableQuantity += quantity;
    this.updatedAt = new Date();
  }

  confirmReservation(quantity: number): void {
    if (this.reservedQuantity < quantity) {
      throw new Error(`Cannot confirm ${quantity}. Only ${this.reservedQuantity} reserved.`);
    }

    this.reservedQuantity -= quantity;
    this.updatedAt = new Date();
  }

  getTotalQuantity(): number {
    return this.availableQuantity + this.reservedQuantity;
  }

  isAvailable(quantity: number): boolean {
    return this.availableQuantity >= quantity;
  }

  toObject() {
    return {
      productId: this.productId,
      productName: this.productName,
      availableQuantity: this.availableQuantity,
      reservedQuantity: this.reservedQuantity,
      totalQuantity: this.getTotalQuantity(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
