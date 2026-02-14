import { Injectable } from '@nestjs/common';
import { IPaymentDriver } from './payment.interface.js';
import { StripeDriver } from './stripe.driver.js';
import { config } from '@sous/config';

@Injectable()
export class PaymentDriverFactory {
  getDriver(provider = 'stripe'): IPaymentDriver {
    switch (provider) {
      case 'stripe':
        if (!config.stripe?.secretKey) {
          throw new Error('Stripe API key is not configured');
        }
        return new StripeDriver(config.stripe.secretKey);
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }
}
