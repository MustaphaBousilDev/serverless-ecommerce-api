// src/infrastructure/external/MockStripeService.ts

import { createLogger } from '../../utils/logger';

export class MockStripeService {
  private logger: any;

  constructor(correlationId?: string) {
    this.logger = createLogger(correlationId || 'no-correlation-id');
  }

  /**
   * Mock Stripe charge
   * Simulates: 80% success, 20% failure
   */
  async charge(amount: number, currency: string): Promise<{ 
    success: boolean; 
    transactionId?: string; 
    error?: string 
  }> {
    this.logger.info('Calling mock Stripe API', { amount, currency });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate 80% success rate
    const random = Math.random();

    if (random < 0.8) {
      // Success
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.logger.info('Payment successful', { transactionId, amount });
      
      return {
        success: true,
        transactionId,
      };
    } else {
      // Failure (20% of the time)
      const errors = [
        'Insufficient funds',
        'Card declined',
        'Expired card',
        'Invalid card number',
      ];
      const error = errors[Math.floor(Math.random() * errors.length)];
      
      this.logger.warn('Payment failed', { error, amount });
      
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * Mock Stripe refund
   */
  async refund(transactionId: string, amount: number): Promise<{ 
    success: boolean; 
    refundId?: string 
  }> {
    this.logger.info('Refunding transaction', { transactionId, amount });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const refundId = `rfnd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.info('Refund successful', { refundId, transactionId });
    
    return {
      success: true,
      refundId,
    };
  }
}