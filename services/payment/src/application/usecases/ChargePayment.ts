import { Payment } from '../../domain/entities/Payment';
import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';
import { IEventPublisher } from '../../domain/events/IEventPublisher';
import { MockStripeService } from '../../infrastructure/external/MockStripeService';

export class ChargePayment {
  constructor(
    private paymentRepository: IPaymentRepository,
    private eventPublisher: IEventPublisher,
    private stripeService: MockStripeService
  ) {}

  async execute(input: {
    orderId: string;
    amount: number;
    currency?: string;
    correlationId: string;
  }): Promise<Payment> {
    // Create payment record
    const payment = Payment.create(input.orderId, input.amount, input.currency);

    // Save payment (status: PENDING)
    await this.paymentRepository.save(payment);

    try {
      // Call Stripe to charge
      const result = await this.stripeService.charge(input.amount, payment.currency);

      if (result.success && result.transactionId) {
        // Payment succeeded
        payment.charge(result.transactionId);
        await this.paymentRepository.update(payment);

        // Publish success event
        await this.eventPublisher.publishPaymentCharged({
          paymentId: payment.paymentId,
          orderId: input.orderId,
          amount: input.amount,
          transactionId: result.transactionId,
        });

        return payment;
      } else {
        // Payment failed
        payment.fail(result.error || 'Unknown error');
        await this.paymentRepository.update(payment);

        // Publish failure event (triggers compensation)
        await this.eventPublisher.publishPaymentFailed({
          orderId: input.orderId,
          reason: result.error || 'Payment processing failed',
        });

        throw new Error(`Payment failed: ${result.error}`);
      }
    } catch (error: any) {
      // Unexpected error
      payment.fail(error.message);
      await this.paymentRepository.update(payment);

      // Publish failure event
      await this.eventPublisher.publishPaymentFailed({
        orderId: input.orderId,
        reason: error.message,
      });

      throw error;
    }
  }
}