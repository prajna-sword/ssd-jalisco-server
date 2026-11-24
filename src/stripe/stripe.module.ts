import { Module } from '@nestjs/common';
import { StripeApiControllerController } from './controllers/stripe-api-controller/stripe-api-controller.controller';
import { StripeWebhooksController } from './controllers/stripe-webhooks-controller/stripe-webhooks.controller';
import { StripeCheckoutSessionService } from './services/stripe-checkout-session-service/stripe-checkout-session-service.service';
import { StripeConnectService } from './services/stripe-connect-service/stripe-connect-service.service';
import { StripeCustomerService } from './services/stripe-customer-service/stripe-customer-service.service';
import { StripePaymentService } from './services/stripe-payment-service/stripe-payment-service.service';
import { StripeWebhooksService } from './services/stripe-webhook-service/stripe-webhooks.service';

@Module({
  controllers: [StripeWebhooksController, StripeApiControllerController],
  providers: [StripeWebhooksService, StripeCustomerService, StripeConnectService, StripePaymentService, StripeCheckoutSessionService],
})
export class StripeModule { }
