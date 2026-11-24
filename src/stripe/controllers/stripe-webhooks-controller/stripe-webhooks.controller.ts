import type { RawBodyRequest } from '@nestjs/common';
import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeWebhooksService } from 'src/stripe/services/stripe-webhook-service/stripe-webhooks.service';
import Stripe from 'stripe';

@Controller('webhook')
export class StripeWebhooksController {
  @Inject(StripeWebhooksService)
  private readonly stripeWebhooksService: StripeWebhooksService;

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

    // Verify request and signature exist;
    if (!req.rawBody || !signature) {
      throw new BadRequestException('Missing raw body or Stripe signature');
    }

    let event: Stripe.Event;

    // Verify signature and create event data
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

    // Process event
    try {
      const result = await this.stripeWebhooksService.handleEvent(event);
      console.log(result);
    } catch (err: any) {
      console.log(err);
    }

    return { received: true };
  }
}
