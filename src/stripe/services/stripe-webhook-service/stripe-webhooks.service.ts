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

    async handleEvent(event: Stripe.Event): Promise<{ received: boolean, duplicate?: boolean }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Claim the event ID
            await queryRunner.manager.insert(StripeWebhookEventEntity, {
                eventId: event.id,
                eventType: event.type,
                status: 'processing',
                payload: event as any
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
                const completedSession = event.data.object as Stripe.Checkout.Session;
                console.log(completedSession);
                break;

            case StripeWebhookEvent.CHECKOUT_SESSION_EXPIRED:
                const expiredSession = event.data.object as Stripe.Checkout.Session;
                console.log(expiredSession);
                break;

            case StripeWebhookEvent.CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED:
                const sessionPaymentSucceeded = event.data.object as Stripe.Checkout.Session;
                console.log(sessionPaymentSucceeded);
                break;

            case StripeWebhookEvent.CHECKOUT_SESSION_ASYNC_PAYMENT_FAILED:
                const sessionPaymentFailed = event.data.object as Stripe.Checkout.Session;
                console.log(sessionPaymentFailed);
                break;

            // ==========================================
            // 2. PAYMENT INTENTS (Holds, Captures, Releases & Incidentals)
            // ==========================================
            case StripeWebhookEvent.PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED:
                const paymentIntentAmountUpdated = event.data.object as Stripe.PaymentIntent;
                console.log(paymentIntentAmountUpdated);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_SUCCEEDED:
                const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
                console.log(paymentIntentSucceeded);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_CANCELED:
                const paymentIntentCanceled = event.data.object as Stripe.PaymentIntent;
                console.log(paymentIntentCanceled);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_PAYMENT_FAILED:
                const paymentIntenFailed = event.data.object as Stripe.PaymentIntent;
                console.log(paymentIntenFailed);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_PROCESSING:
                const paymentIntentProcessing = event.data.object as Stripe.PaymentIntent;
                console.log(paymentIntentProcessing);
                break;

            // ==========================================
            // 3. CHARGES & REFUNDS (Post-Capture Disputes & Refunds)
            // ==========================================
            case StripeWebhookEvent.CHARGE_SUCCEEDED:
                const chargeSucceeded = event.data.object as Stripe.Charge;
                console.log(chargeSucceeded);
                break;

            case StripeWebhookEvent.CHARGE_CAPTURED:
                const chargeCaptured = event.data.object as Stripe.Charge;
                console.log(chargeCaptured);
                break;

            case StripeWebhookEvent.CHARGE_REFUNDED:
                const chargeRefunded = event.data.object as Stripe.Charge;
                console.log(chargeRefunded);
                break;

            case StripeWebhookEvent.CHARGE_DISPUTE_CREATED:
                const disputeCreated = event.data.object as Stripe.Dispute;
                console.log(disputeCreated);
                break;

            case StripeWebhookEvent.CHARGE_DISPUTE_CLOSED:
                const disputeClosed = event.data.object as Stripe.Dispute;
                console.log(disputeClosed);
                break;

            // ==========================================
            // 4. CUSTOMERS & SAVED PAYMENT METHODS (Cards on File)
            // ==========================================
            case StripeWebhookEvent.PAYMENT_METHOD_ATTACHED:
                const paymentMethodAttached = event.data.object as Stripe.PaymentMethod;
                console.log(paymentMethodAttached);
                break;

            case StripeWebhookEvent.PAYMENT_METHOD_DETACHED:
                const paymentMethodDetached = event.data.object as Stripe.PaymentMethod;
                console.log(paymentMethodDetached);
                break;

            case StripeWebhookEvent.PAYMENT_METHOD_AUTOMATICALLY_UPDATED:
                const paymentMethodAutoUpdate = event.data.object as Stripe.PaymentMethod;
                console.log(paymentMethodAutoUpdate);
                break;

            case StripeWebhookEvent.CUSTOMER_UPDATED:
                const customerUpdate = event.data.object as Stripe.Customer;
                console.log(customerUpdate);
                break;

            // ==========================================
            // 5. CONNECT ACCOUNTS (Express Client Onboarding - Connect Scope)
            // ==========================================
            case StripeWebhookEvent.ACCOUNT_UPDATED:
                const account = event.data.object as Stripe.Account;
                console.log(account);
                break;

            case StripeWebhookEvent.ACCOUNT_APPLICATION_DEAUTHORIZED:
                const application = event.data.object as Stripe.Application;
                console.log(application);
                break;

            case StripeWebhookEvent.CAPABILITY_UPDATED:
                const capability = event.data.object as Stripe.Capability;
                console.log(capability);
                break;

            // ==========================================
            // 6. TRANSFERS & PAYOUTS (Splitting Funds & Partial Payouts)
            // ==========================================
            case StripeWebhookEvent.TRANSFER_CREATED:
                const transferCreated = event.data.object as Stripe.Transfer;
                console.log(transferCreated);
                break;

            case StripeWebhookEvent.TRANSFER_UPDATED:
                const transferUpdated = event.data.object as Stripe.Transfer;
                console.log(transferUpdated);
                break;

            case StripeWebhookEvent.TRANSFER_REVERSED:
                const transferReverse = event.data.object as Stripe.Transfer;
                console.log(transferReverse);
                break;

            case StripeWebhookEvent.PAYOUT_CREATED:
                const payoutCreated = event.data.object as Stripe.Payout;
                console.log(payoutCreated);
                break;

            case StripeWebhookEvent.PAYOUT_PAID:
                const payoutPaid = event.data.object as Stripe.Payout;
                console.log(payoutPaid);
                break;

            case StripeWebhookEvent.PAYOUT_FAILED:
                const payoutFailed = event.data.object as Stripe.Payout;
                console.log(payoutFailed);
                break;

            case StripeWebhookEvent.PAYOUT_CANCELED:
                const payoutCanceled = event.data.object as Stripe.Payout;
                console.log(payoutCanceled);
                break;

            default:
                console.log(`Unhandled event: ${event.type}`);
                break;
        }
    }

}
