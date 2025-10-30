import { CreateOrderRequestDto } from '../dtos/CreateOrderDto';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class OrderValidator {

    static validateCreateOrder(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.userId || typeof data.userId !== 'string' || data.userId.trim() === '') {
      errors.push('userId is required and must be a non-empty string');
    }

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
 }