import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BookingsService } from 'src/lodging/bookings/bookings.service';
import { BookingPayload } from 'src/lodging/bookings/dto/booking-payload.dto';
import { GuestsService } from 'src/lodging/guests/guests.service';
import { RoomsService } from 'src/lodging/rooms/rooms.service';
import { PaymentsService } from 'src/payments/payments.service';
import { StripeCustomerService } from 'src/stripe/services/stripe-customer-service/stripe-customer.service';
import { calculateBookingTotalV2 } from 'src/util/booking-calculation.util';
import Stripe from 'stripe';
import { DataSource } from 'typeorm';

@Injectable()
export class StripePaymentService {
    private readonly stripe: Stripe;
    @Inject(RoomsService)
    private readonly roomService: RoomsService;
    @Inject(StripeCustomerService)
    private readonly customerService: StripeCustomerService;
    @Inject(GuestsService)
    private readonly guestsService: GuestsService;
    @Inject(BookingsService)
    private readonly bookingService: BookingsService;
    @Inject(PaymentsService)
    private readonly paymentService: PaymentsService;

    constructor(private readonly dataSource: DataSource) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
        });
    }

    async generateCheckoutIntent(
        booking: BookingPayload
    ) {
        /** Calculate Room Total */
        const rooms = await this.roomService.findByClientPageId(booking.clientPageId);
        let totalAmount = calculateBookingTotalV2(booking.rooms, rooms);
        const amountInCents = Math.round(totalAmount * 100);

        /** Find or Create Guest Entity  */
        let existingGuest = await this.guestsService.findBookingGuest(booking);

        /** Create Customer & Guest if not exists */
        let customerId = existingGuest?.stripeCustId;
        if (!existingGuest || !customerId) {
            customerId = await this.customerService.createCustomer(
                booking.guest.guestName,
                booking.guest.emailAddress,
                booking.guest.phoneNumber
            );
            existingGuest = await this.guestsService.createBookingGuest(booking, customerId);
        }

        /** Create the payment intent to place hold */
        const intent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'mxn',
            customer: customerId,
            capture_method: 'manual',
            setup_future_usage: 'off_session',
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
            // ...(params.connectedAccountId && {
            //     transfer_data: { destination: params.connectedAccountId },
            //     application_fee_amount: params.applicationFeeAmount,
            // }),
        });

        const { savedBooking, savedPayment } = await this.dataSource.transaction(async (manager) => {
            const newBooking = await this.bookingService.createPendingBooking(
                booking,
                existingGuest.guestId,
                manager
            );

            const newPayment = await this.paymentService.createPending(
                newBooking.bookingId,
                existingGuest.guestId,
                intent.id,
                totalAmount as unknown as string,
                manager,
            );

            return { savedBooking: newBooking, savedPayment: newPayment };
        });

        return {
            clientSecret: intent.client_secret,
            totalAmountUSD: totalAmount,
            bookingId: savedBooking.bookingUuid
        };
    } catch(error) {
        throw new BadRequestException(`Stripe Intent failed: ${(error as Error).message}`);
    }

    // 2. Capture funds at checkout (pass a smaller amount for partial capture)
    async captureHold(paymentIntentId: string, finalAmountInCentavos?: number) {
        return this.stripe.paymentIntents.capture(paymentIntentId, {
            ...(finalAmountInCentavos && { amount_to_capture: finalAmountInCentavos }),
        });
    }

    // 3. Release the hold completely if there are no incidentals
    async releaseHold(paymentIntentId: string) {
        return this.stripe.paymentIntents.cancel(paymentIntentId);
    }

}
