import { OrderItem } from '../../domain/entities/OrderItem';
import { CreateOrderRequestDto } from '../dtos/CreateOrderDto';
import { 
  OrderMinimumNotMetError,
  OrderMaximumExceededError,
  TooManyItemsError,
  ValidationError
} from '../../../../inventory/src/domain/errors/DomainErrors';
import { MetricsPublisher } from '../../shared/utils/metrics';
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class OrderValidator {

  static readonly MIN_ORDER_AMOUNT = 10; // $10 
  static readonly MAX_ORDER_AMOUNT = 10000; // $10,000 
  static readonly MAX_ITEMS_PER_ORDER = 50;
  static readonly MIN_ITEMS_PER_ORDER = 1;

    static validateCreateOrder(data: any): ValidationResult {
    const errors: string[] = [];

    

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('items array is required and must contain at least one item');
    } else {
      data.items.forEach((item: any, index: number) => {
        if (!item.productId || typeof item.productId !== 'string') {
          errors.push(`items[${index}].productId is required and must be a string`);
        }

        if (!item.productName || typeof item.productName !== 'string') {
          errors.push(`items[${index}].productName is required and must be a string`);
        }

        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          errors.push(`items[${index}].quantity must be a positive number`);
        }

        if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
          errors.push(`items[${index}].unitPrice must be a positive number`);
        }
      });
    }

    // Validate shippingAddress
    if (!data.shippingAddress || typeof data.shippingAddress !== 'object') {
      errors.push('shippingAddress is required and must be an object');
    } else {
      const address = data.shippingAddress;

      if (!address.street || typeof address.street !== 'string') {
        errors.push('shippingAddress.street is required and must be a string');
      }

      if (!address.city || typeof address.city !== 'string') {
        errors.push('shippingAddress.city is required and must be a string');
      }

      if (!address.state || typeof address.state !== 'string') {
        errors.push('shippingAddress.state is required and must be a string');
      }

      if (!address.country || typeof address.country !== 'string') {
        errors.push('shippingAddress.country is required and must be a string');
      }

      if (!address.zipCode || typeof address.zipCode !== 'string') {
        errors.push('shippingAddress.zipCode is required and must be a string');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

    static validateGetOrder(orderId: any): ValidationResult {
        const errors: string[] = [];

        if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
            errors.push('orderId is required and must be a non-empty string');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    static validateListOrders(userId: any): ValidationResult {
        const errors: string[] = [];

        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            errors.push('userId is required and must be a non-empty string');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    static validateOrderTotal(items: OrderItem[], expectedTotal: number): void {
      const calculatedTotal = items.reduce(
        (sum, item) => sum + item.getTotalPrice(),0
      )
      //using small epsilon for floating point comparison
      const epsilon = 0.01
      const difference = Math.abs(calculatedTotal-expectedTotal)
      if(difference > epsilon){
        throw new ValidationError(
          'Order total mismatch',
          {
            expectedTotal,
            calculatedTotal,
            difference
          }
        );
      }
    }

    static validateMinimumAmount(totalAmount: number): void {
      if(totalAmount < this.MIN_ORDER_AMOUNT){
        throw new OrderMinimumNotMetError(totalAmount, this.MIN_ORDER_AMOUNT);
      }
    }

    static validateMaximumAmount(totalAmount: number): void {
      if (totalAmount > this.MAX_ORDER_AMOUNT) {
        throw new OrderMaximumExceededError(totalAmount, this.MAX_ORDER_AMOUNT);
      }
    }

    static validateItemCount(items: OrderItem[]): void {
      if (items.length < this.MIN_ITEMS_PER_ORDER) {
        throw new ValidationError(
          `Order must have at least ${this.MIN_ITEMS_PER_ORDER} item(s)`,
          { itemCount: items.length, minimum: this.MIN_ITEMS_PER_ORDER }
        );
      }
      if (items.length > this.MAX_ITEMS_PER_ORDER) {
        throw new TooManyItemsError(items.length, this.MAX_ITEMS_PER_ORDER);
      }
    }

    static validateOrder(items: OrderItem[], totalAmount: number): void {
      this.validateItemCount(items);
      this.validateOrderTotal(items, totalAmount);
      this.validateMinimumAmount(totalAmount);
      this.validateMaximumAmount(totalAmount);
    }

 }