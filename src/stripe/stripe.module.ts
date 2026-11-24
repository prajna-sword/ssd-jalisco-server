import { Module } from '@nestjs/common';
import { StripeApiControllerController } from './controllers/stripe-api-controller/stripe-api-controller.controller';
import { StripeWebhooksController } from './controllers/stripe-webhooks-controller/stripe-webhooks.controller';
import { StripeCheckoutSessionServiceService } from './services/stripe-checkout-session-service/stripe-checkout-session-service.service';
import { StripeConnectServiceService } from './services/stripe-connect-service/stripe-connect-service.service';
import { StripeCustomerServiceService } from './services/stripe-customer-service/stripe-customer-service.service';
import { StripePaymentServiceService } from './services/stripe-payment-service/stripe-payment-service.service';
import { StripeWebhooksService } from './services/stripe-webhook-service/stripe-webhooks.service';

@Module({
  controllers: [StripeWebhooksController, StripeApiControllerController],
  providers: [StripeWebhooksService, StripeCustomerServiceService, StripeConnectServiceService, StripePaymentServiceService, StripeCheckoutSessionServiceService],
})
export class StripeModule { }
