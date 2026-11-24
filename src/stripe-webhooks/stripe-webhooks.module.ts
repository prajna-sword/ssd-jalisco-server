import { Module } from '@nestjs/common';
import { StripeWebhooksService } from './stripe-webhooks.service';
import { StripeWebhooksController } from './stripe-webhooks.controller';

@Module({
  controllers: [StripeWebhooksController],
  providers: [StripeWebhooksService],
})
export class StripeWebhooksModule {}
