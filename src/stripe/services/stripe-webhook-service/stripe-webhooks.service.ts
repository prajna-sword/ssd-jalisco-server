import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { StripeWebhookEventEntity } from 'src/stripe/entities/stripe-webhook-event.entity';
import { StripeWebhookEvent } from 'src/stripe/models/stripe.constants';
import Stripe from 'stripe';
import { DataSource } from 'typeorm';

@Injectable()
export class StripeWebhooksService {
    private readonly stripe: Stripe;
    private readonly logger = new Logger(StripeWebhooksService.name);

    constructor(private readonly dataSource: DataSource) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
        });
    }

    async handleEvent(event: Stripe.Event): Promise<{ received: boolean, duplicate?:  boolean }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Claim the event ID
            await queryRunner.manager.insert(StripeWebhookEventEntity, {
                eventId: event.id,
                eventType: event.type,
                status: 'processing',
            });

            // Handles specific business logic for each event type
            await this.handleEventType(event, queryRunner);

            // 4. Mark processed & commit
            await queryRunner.manager.update(
                StripeWebhookEventEntity,
                { eventId: event.id },
                { status: 'processed', processedAt: new Date() },
            );

            await queryRunner.commitTransaction();
            return { received: true };

        } catch (err: any) {
            await queryRunner.rollbackTransaction();

            // Catch Postgres unique constraint violation (duplicate event)
            const pgErrorCode = err?.code || err?.driverError?.code;
            if (pgErrorCode === '23505') {
                this.logger.log(`Duplicate Stripe event ignored: ${event.id}`);
                return { received: true, duplicate: true };
            }

            this.logger.error(`Failed processing event ${event.id}`, err.stack);
            throw new InternalServerErrorException('Webhook processing failed');
        } finally {
            await queryRunner.release();
        }
    }

    async handleEventType(event: Stripe.Event, queryRunner: any): Promise<void> {
        switch (event.type as StripeWebhookEvent) {
            // ==========================================
            // 1. CHECKOUT SESSIONS (QR Code Flows)
            // ==========================================
            case StripeWebhookEvent.CHECKOUT_SESSION_COMPLETED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CHECKOUT_SESSION_EXPIRED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CHECKOUT_SESSION_ASYNC_PAYMENT_FAILED:
                console.log(event.type);
                break;

            // ==========================================
            // 2. PAYMENT INTENTS (Holds, Captures, Releases & Incidentals)
            // ==========================================
            case StripeWebhookEvent.PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_SUCCEEDED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_CANCELED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_PAYMENT_FAILED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_PROCESSING:
                console.log(event.type);
                break;

            // ==========================================
            // 3. CHARGES & REFUNDS (Post-Capture Disputes & Refunds)
            // ==========================================
            case StripeWebhookEvent.CHARGE_SUCCEEDED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CHARGE_CAPTURED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CHARGE_REFUNDED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CHARGE_DISPUTE_CREATED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CHARGE_DISPUTE_CLOSED:
                console.log(event.type);
                break;

            // ==========================================
            // 4. CUSTOMERS & SAVED PAYMENT METHODS (Cards on File)
            // ==========================================
            case StripeWebhookEvent.PAYMENT_METHOD_ATTACHED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYMENT_METHOD_DETACHED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYMENT_METHOD_AUTOMATICALLY_UPDATED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CUSTOMER_UPDATED:
                console.log(event.type);
                break;

            // ==========================================
            // 5. CONNECT ACCOUNTS (Express Client Onboarding - Connect Scope)
            // ==========================================
            case StripeWebhookEvent.ACCOUNT_UPDATED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.ACCOUNT_APPLICATION_DEAUTHORIZED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.CAPABILITY_UPDATED:
                console.log(event.type);
                break;

            // ==========================================
            // 6. TRANSFERS & PAYOUTS (Splitting Funds & Partial Payouts)
            // ==========================================
            case StripeWebhookEvent.TRANSFER_CREATED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.TRANSFER_UPDATED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.TRANSFER_REVERSED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYOUT_CREATED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYOUT_PAID:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYOUT_FAILED:
                console.log(event.type);
                break;

            case StripeWebhookEvent.PAYOUT_CANCELED:
                console.log(event.type);
                break;

            default:
                console.log(`Unhandled event: ${event.type}`);
                break;
        }
    }







}
