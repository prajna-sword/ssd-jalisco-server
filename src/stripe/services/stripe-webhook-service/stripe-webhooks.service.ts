import { Injectable } from '@nestjs/common';
import { StripeWebhookEvent } from 'src/stripe/models/stripe.constants';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhooksService {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
        });
    }

    handleEvent(event: Stripe.Event): void {
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
