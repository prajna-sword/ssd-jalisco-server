import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RoomsService } from 'src/lodging/rooms/rooms.service';
import { RoomSelection } from 'src/payments/dto/create-payment.dto';
import { calculateBookingTotalV2 } from 'src/util/booking-calculation.util';
import Stripe from 'stripe';

@Injectable()
export class StripePaymentService {
    private readonly stripe: Stripe;
    @Inject(RoomsService)
    private readonly roomService: RoomsService;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
        });
    }

    // TODO -- verify that the current calculation method is safe since the amount of 
    // days will have to be passed from the UI and it could be mutable?
    async generateCheckoutIntent(clientPageId: string, bookingDetails: RoomSelection[]) {
        const rooms = await this.roomService.findByClientPageId(clientPageId);

        let totalAmount = calculateBookingTotalV2(bookingDetails, rooms);

        // 2. Stripe expects integers in the smallest currency unit (cents/sub-currency)
        // $100.50 USD becomes 10050 cents. (If using MXN, pesos also use cents)
        const amountInCents = Math.round(totalAmount * 100);

        // 3. Create the payment intent object on Stripe's cloud API
        const intent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'mxn', // or 'mxn' if pricing natively in Mexican Pesos
            setup_future_usage: 'off_session', // 👈 Must match the client-side configuration!
            // Highly recommended for elements: allows automatic support for card, Link, ApplePay, etc.
            automatic_payment_methods: {
                enabled: true,
            },

            // Optional metadata tracker to match Stripe dashboard entries to your local DB
            // metadata: {
            //   hotelLocation: 'Jalisco_Mexico',
            //   roomIds: roomIdString,
            //   totalNights: nights.toString(),
            // },
        });

        // 4. Return the unique client secret safely back to the client app
        return {
            clientSecret: intent.client_secret,
            totalAmountUSD: totalAmount,
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
