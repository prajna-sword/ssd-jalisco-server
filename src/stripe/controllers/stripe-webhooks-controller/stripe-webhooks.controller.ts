import type { RawBodyRequest } from '@nestjs/common';
import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

@Controller('webhook')
export class StripeWebhooksController {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeWebhooksController.name);
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
    });
  }

  @Post('/:scope')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('scope') scope: 'platform' | 'connect',
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody || !signature) {
      throw new BadRequestException('Missing raw body or Stripe signature');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Log scope, event type, connected account ID (if present), and full payload
    this.logger.log(`=========================================`);
    this.logger.log(`Scope:   ${scope.toUpperCase()}`);
    this.logger.log(`Event:   ${event.type} (${event.id})`);
    if (event.account) {
      this.logger.log(`Account: ${event.account}`);
    }
    this.logger.debug(`Payload: ${JSON.stringify(event.data.object, null, 2)}`);

    return { received: true };
  }
}
