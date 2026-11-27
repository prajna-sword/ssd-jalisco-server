import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'src/client/clients/entities/client.entity';
import { BookingStatus } from 'src/lodging/bookings/dto/booking-constants';
import { Booking } from 'src/lodging/bookings/entities/booking.entity';
import { PaymentStatuses, PaymentTypes } from 'src/payments/dto/payment-constants';
import { Payment } from 'src/payments/entities/payment.entity';
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
                await this.handlePaymentIntentCaptureUpdate(event, queryRunner);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_SUCCEEDED:
                await this.handlePaymentIntentSuccess(event, queryRunner);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_CANCELED:
                await this.handlePaymentIntentCancel(event, queryRunner);
                break;

            case StripeWebhookEvent.PAYMENT_INTENT_PAYMENT_FAILED:
                await this.handlePaymentIntentFailure(event, queryRunner);
                break;

            // ==========================================
            // 3. CHARGES & REFUNDS (Post-Capture Disputes & Refunds)
            // ==========================================
            case StripeWebhookEvent.CHARGE_REFUNDED:
                await this.handleChargeRefunded(event, queryRunner);
                break;

            case StripeWebhookEvent.CHARGE_DISPUTE_CREATED:
                await this.handleChargeDispute(event, queryRunner);
                break;

            case StripeWebhookEvent.CHARGE_DISPUTE_CLOSED:
                await this.handleChargeDisputeClosed(event, queryRunner);
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
                await this.handleAccountUpdate(event, queryRunner);
                break;
            case StripeWebhookEvent.ACCOUNT_APPLICATION_DEAUTHORIZED:
                await this.handleAccountDeauthorized(event, queryRunner);
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

    async handlePaymentIntentCaptureUpdate(event: Stripe.Event, queryRunner: any): Promise<void> {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentMethodId =
            typeof pi.payment_method === 'string'
                ? pi.payment_method
                : pi.payment_method?.id;

        const paymentRepo = queryRunner.manager.getRepository(Payment);
        const bookingRepo = queryRunner.manager.getRepository(Booking);

        const payment = await paymentRepo.findOne({
            where: {
                paymentIntentId: pi.id
            },
            relations: {
                booking: {
                    guest: true
                }
            }
        });

        if (!payment) {
            // TODO??
            return;
        }

        payment.paymentStatus = PaymentStatuses.AUTHORIZED;
        await paymentRepo.save(payment);

        // Handle incidentals differently
        if (payment.paymentType === PaymentTypes.ROOM_HOLD) {
            payment.booking.bookingStatus = BookingStatus.CONFIRMED;
            payment.booking.paymentMethodId = paymentMethodId;
            await bookingRepo.save(payment.booking);
        }
    }

    async handlePaymentIntentSuccess(event: Stripe.Event, queryRunner: any): Promise<void> {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentMethodId =
            typeof pi.payment_method === 'string'
                ? pi.payment_method
                : pi.payment_method?.id;

        const paymentRepo = queryRunner.manager.getRepository(Payment);
        const bookingRepo = queryRunner.manager.getRepository(Booking);

        const payment = await paymentRepo.findOne({
            where: { paymentIntentId: pi.id },
            relations: {
                booking: true
            },
        });

        if (!payment) {
            return;
        }

        // 1. Idempotency check: skip if we already processed this capture
        if (payment.paymentStatus === PaymentStatuses.CAPTURED) {
            return;
        }

        // 2. Mark Payment as CAPTURED and record actual settled amount
        payment.paymentStatus = PaymentStatuses.CAPTURED;
        payment.capturedAmount = (pi.amount_received / 100) as unknown as string; // Great if you ever do partial captures
        payment.failureReason = null;
        await paymentRepo.save(payment);

        // 3. If this was the main room hold, ensure Booking is CONFIRMED & card is saved
        if (payment.type === PaymentTypes.ROOM_HOLD && payment.booking) {
            let bookingChanged = false;

            if (payment.booking.bookingStatus !== BookingStatus.CONFIRMED) {
                payment.booking.bookingStatus = BookingStatus.CONFIRMED;
                bookingChanged = true;
            }

            if (!payment.booking.stripePaymentMethodId && paymentMethodId) {
                payment.booking.stripePaymentMethodId = paymentMethodId;
                bookingChanged = true;
            }

            if (bookingChanged) {
                await bookingRepo.save(payment.booking);
            }
        }
    }

    async handlePaymentIntentCancel(event: Stripe.Event, queryRunner: any): Promise<void> {
        const pi = event.data.object as Stripe.PaymentIntent;

        const paymentRepo = queryRunner.manager.getRepository(Payment);
        const bookingRepo = queryRunner.manager.getRepository(Booking);

        const payment = await paymentRepo.findOne({
            where: { paymentIntentId: pi.id },
            relations: {
                booking: true
            },
        });

        if (!payment || payment.paymentStatus === PaymentStatuses.CANCELED) {
            return;
        }

        const wasPreviouslyAuthorized = payment.paymentStatus === PaymentStatuses.AUTHORIZED;

        // 1. Mark the Payment as CANCELED and store why
        payment.paymentStatus = PaymentStatuses.CANCELED;
        payment.failureReason = pi.cancellation_reason || PaymentStatuses.CANCELED; // e.g. 'requested_by_customer', 'abandoned', 'automatic'
        await paymentRepo.save(payment);

        // 2. Update the parent Booking if this was the main room hold
        if (payment.type === 'ROOM_HOLD' && payment.booking) {
            if (pi.cancellation_reason === 'automatic' && wasPreviouslyAuthorized) {
                // CRITICAL ALERT: Your 5-day cron missed a confirmed hold and it expired at Day 7!
                payment.booking.bookingStatus = BookingStatus.HOLD_EXPIRED;
                // TODO: Trigger an internal alert / email to staff so you can charge their saved card off-session!
            } else {
                // Guest canceled before capture OR abandoned checkout
                payment.booking.bookingStatus = BookingStatus.CANCELED;
            }

            await bookingRepo.save(payment.booking);
        }

    }

    async handlePaymentIntentFailure(event: Stripe.Event, queryRunner: any): Promise<void> {
        const pi = event.data.object as Stripe.PaymentIntent;
        const errorMessage = pi.last_payment_error?.message || 'Payment failed';
        const declineCode = pi.last_payment_error?.decline_code;

        const paymentRepo = queryRunner.manager.getRepository(Payment);

        const payment = await paymentRepo.findOne({
            where: { paymentIntentId: pi.id },
            relations: {
                booking: true
            },
        });

        if (!payment) {
            return;
        }

        if (payment.type === PaymentTypes.INCIDENTAL_CHARGE) {
            // Off-session incidental failed -> mark FAILED and alert hotel staff / email guest
            payment.paymentStatus = PaymentStatuses.FAILED;
            payment.failureReason = `${declineCode || 'error'}: ${errorMessage}`;
            await paymentRepo.save(payment);
        } else {
            // Initial ROOM_HOLD failed -> keep Payment & Booking as PENDING so guest can retry
            payment.failureReason = `${declineCode || 'error'}: ${errorMessage}`;
            await paymentRepo.save(payment);
        }
    }

    async handleChargeRefunded(event: Stripe.Event, queryRunner: any): Promise<void> {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
            typeof charge.payment_intent === 'string'
                ? charge.payment_intent
                : charge.payment_intent?.id;

        if (!paymentIntentId) {
            return;
        }

        const paymentRepo = queryRunner.manager.getRepository(Payment);
        const bookingRepo = queryRunner.manager.getRepository(Booking);

        const payment = await paymentRepo.findOne({
            where: { paymentIntentId: paymentIntentId },
            relations: {
                booking: true
            },
        });

        if (!payment) {
            return;
        }

        // 1. Idempotency check: skip if we already processed this exact refunded amount
        if (payment.amountRefunded === charge.amount_refunded) {
            return;
        }

        // 2. Update Payment status & cumulative refunded amount
        payment.refundedAmount = charge.amount_refunded;
        payment.isRefunded = charge.refunded;
        payment.paymentStatus = charge.refunded ? PaymentStatuses.REFUNDED : PaymentStatuses.PARTIALLY_REFUNDED;
        await paymentRepo.save(payment);

        // 3. Only mark the Booking as REFUNDED if the main room charge was 100% refunded
        if (payment.type === PaymentTypes.ROOM_HOLD && charge.refunded && payment.booking) {
            payment.booking.bookingStatus = BookingStatus.CANCELED;
            await bookingRepo.save(payment.booking);
        }
    }

    async handleChargeDispute(event: Stripe.Event, queryRunner: any): Promise<void> {
        const dispute = event.data.object as Stripe.Dispute;
        const paymentIntentId =
            typeof dispute.payment_intent === 'string'
                ? dispute.payment_intent
                : dispute.payment_intent?.id;

        if (!paymentIntentId) {
            return;
        };

        const paymentRepo = queryRunner.manager.getRepository(Payment);
        const bookingRepo = queryRunner.manager.getRepository(Booking);

        const payment = await paymentRepo.findOne({
            where: { paymentIntentId: paymentIntentId },
            relations: {
                booking: {
                    guest: true
                }
            },
        });

        if (!payment) {
            return;
        }

        // 1. Idempotency check
        if (payment.paymentStatus === PaymentStatuses.DISPUTED) {
            return;
        }

        const evidenceDueBy = dispute.evidence_details?.due_by
            ? new Date(dispute.evidence_details.due_by * 1000)
            : null;

        // 2. Mark Payment as DISPUTED and save dispute metadata
        payment.paymentStatus = PaymentStatuses.DISPUTED;
        payment.disputeId = dispute.id; // Useful for matching later or submitting evidence via API
        payment.failureReason = `Dispute (${dispute.reason})${evidenceDueBy ? ` - Evidence due by ${evidenceDueBy.toISOString()}` : ''
            }`;
        await paymentRepo.save(payment);

        // 3. Flag the parent Booking as DISPUTED (applies whether it's ROOM_HOLD or INCIDENTAL)
        if (payment.booking && payment.booking.bookingStatus !== BookingStatus.DISPUTED) {
            payment.booking.bookingStatus = BookingStatus.DISPUTED;
            await bookingRepo.save(payment.booking);
        }

        // TODO -- disable guest?
        // TODO -- send notification
    }

    async handleChargeDisputeClosed(event: Stripe.Event, queryRunner: any): Promise<void> {
        const dispute = event.data.object as Stripe.Dispute;
        const paymentIntentId =
            typeof dispute.payment_intent === 'string'
                ? dispute.payment_intent
                : dispute.payment_intent?.id;

        if (!paymentIntentId) {
            return;
        }

        const paymentRepo = queryRunner.manager.getRepository(Payment);
        const bookingRepo = queryRunner.manager.getRepository(Booking);

        const payment = await paymentRepo.findOne({
            where: { paymentIntentId: paymentIntentId },
            relations: {
                booking: true
            },
        });

        if (!payment) {
            return;
        }

        const isWon = dispute.status === 'won' || dispute.status === 'warning_closed';

        // 1. Idempotency check
        if (isWon && payment.paymentStatus === PaymentStatuses.CAPTURED) {
            return;
        }
        if (!isWon && payment.paymentStatus === PaymentStatuses.DISPUTE_LOST) {
            return;
        }

        // 2. Update Payment based on final verdict
        if (isWon) {
            payment.paymentStatus = payment.amountRefunded > 0 ? PaymentStatuses.PARTIALLY_REFUNDED : PaymentStatuses.CAPTURED;
            payment.failureReason = null;
        } else {
            // dispute.status === 'lost'
            payment.paymentStatus = PaymentStatuses.DISPUTE_LOST;
            payment.failureReason = `Dispute lost (${dispute.reason})`;
        }

        await paymentRepo.save(payment);

        // 3. Update parent Booking status
        if (payment.booking && payment.booking.bookingStatus === BookingStatus.DISPUTED) {
            if (isWon) {
                // TODO: Restore booking status (or check if checkoutDate < now to set 'COMPLETED')
                payment.booking.bookingStatus = BookingStatus.CONFIRMED;
            } else {
                payment.booking.bookingStatus = BookingStatus.DISPUTE_LOST;
            }

            await bookingRepo.save(payment.booking);
        }
    }

    async handleAccountUpdate(event: Stripe.Event, queryRunner: any): Promise<void> {
        const account = event.data.object as Stripe.Account;
        await queryRunner.manager.update(Client,
            { stripeAccountId: account.id },
            {
                stripePayoutsEnabled: account.payouts_enabled,
                stripeChargesEnabled: account.charges_enabled,
                stripeOnboardingComplete: account.details_submitted,
                stripeRequirementsDue: account.requirements?.currently_due || [],
                disabledReason: account.requirements?.disabled_reason || null,
                stripeAccountClosed: false,
            });
    }

    async handleAccountDeauthorized(event: Stripe.Event, queryRunner: any): Promise<void> {
        const closedAccountId = event.account;
        await queryRunner.manager.update(Client,
            { stripeAccountId: closedAccountId },
            {
                stripePayoutsEnabled: false,
                stripeChargesEnabled: false,
                stripeOnboardingComplete: false,
                stripeAccountClosed: true,
                stripeRequirementsDue: [],
                disabledReason: 'closed_by_user'
            });
    }
}
