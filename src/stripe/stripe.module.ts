import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'src/client/clients/entities/client.entity';
import { BookingsModule } from 'src/lodging/bookings/bookings.module';
import { GuestsModule } from 'src/lodging/guests/guests.module';
import { RoomsModule } from 'src/lodging/rooms/rooms.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { StripeWebhookEventEntity } from 'src/stripe/entities/stripe-webhook-event.entity';
import { StripeApiController } from './controllers/stripe-api-controller/stripe-api-controller.controller';
import { StripeWebhooksController } from './controllers/stripe-webhooks-controller/stripe-webhooks.controller';
import { StripeCheckoutSessionService } from './services/stripe-checkout-session-service/stripe-checkout-session.service';
import { StripeConnectService } from './services/stripe-connect-service/stripe-connect.service';
import { StripeCustomerService } from './services/stripe-customer-service/stripe-customer.service';
import { StripePaymentService } from './services/stripe-payment-service/stripe-payment.service';
import { StripeWebhooksService } from './services/stripe-webhook-service/stripe-webhooks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StripeWebhookEventEntity, Client]),
    RoomsModule,
    BookingsModule,
    PaymentsModule,
    GuestsModule
  ],
  controllers: [
    StripeWebhooksController,
    StripeApiController
  ],
  providers: [
    StripeWebhooksService,
    StripeCustomerService,
    StripeConnectService,
    StripePaymentService,
    StripeCheckoutSessionService
  ],
})
export class StripeModule { }
