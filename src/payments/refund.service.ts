import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { differenceInCalendarDays, differenceInMilliseconds } from 'date-fns';
import { ClientPagesService } from 'src/client/client-pages/client-pages.service';
import { BookingsService } from 'src/lodging/bookings/bookings.service';
import { Booking } from 'src/lodging/bookings/entities/booking.entity';
import Stripe from 'stripe';
import { RefundPaymentPayload } from './dto/refund-payment.dto';
import { PaymentsService } from './payments.service';

@Injectable()
export class RefundService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private clientPagesService: ClientPagesService,
    private bookingsService: BookingsService,
    private paymentsService: PaymentsService
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') as any, {
      apiVersion: '2026-08-26.dahlia' as any, // Standard modern Stripe API typing fallback
    });
  }

  async refundPayment(payload: RefundPaymentPayload): Promise<any> {
    const savedBookingOne = await this.bookingsService.findOne(payload.bookingIds[0]);
    const now = new Date();
    const millisecondsSinceBooking = differenceInMilliseconds(now, savedBookingOne?.bookingTimestamp as Date);
    const exactHours = millisecondsSinceBooking / 360000;
    const fiveDaysInHours = 24 * 5;
    const isWithinFiveDays = exactHours < fiveDaysInHours;

    let refundTotal = 0;
    let refundedBookings: Booking[] = [];
    for (let i = 0; i < payload.bookingIds.length; i++) {
      let savedBooking;
      if (i === 0) {
        savedBooking = savedBookingOne;
      } else {
        savedBooking = await this.bookingsService.findOne(payload.bookingIds[i]);
      }
      refundedBookings.push(savedBooking);
      let diff = differenceInCalendarDays(savedBooking?.checkOutDate as Date, savedBooking?.checkInDate as Date);
      refundTotal += diff * this.moneyToNumber(savedBooking?.bookedRate as string);
    }

    if (!isWithinFiveDays) {
      const clientPage = await this.clientPagesService.findOne(payload.clientPageId);

      let flatRateDeduction = 0;
      let percentRateDeduction = 0;

      // if (clientPage?.cancellationFlatRate) {
      //   flatRateDeduction = this.moneyToNumber(clientPage.cancellationFlatRate);
      // }

      // if (clientPage?.cancellationPercentRate) {
      //   percentRateDeduction = refundTotal * clientPage.cancellationPercentRate;
      // }

      refundTotal = (refundTotal - (flatRateDeduction + percentRateDeduction));
    }

    // TOOD -- ERROR HANDLING + LOGGING
    if (refundTotal !== this.moneyToNumber(payload.refundAmount)) {
      console.log('Expected refund total does not match computed total.');
    }

    // TOOD -- ERROR HANDLING + LOGGING
    if (refundTotal <= 0) {
      console.log('Computed Refund Amount is less than or equal to zero.')
    }

    // TODO - check response status
    const stripeResponse = await this.stripe.refunds.create({
      payment_intent: payload.paymentIntentId,
      amount: refundTotal * 100 // total in cents
    });

    await this.paymentsService.refundPayment(payload.paymentIntentId, refundTotal);

    for (let booking of refundedBookings) {
      await this.bookingsService.cancelBooking(booking);
    }

    return stripeResponse;
  }

  moneyToNumber(moneyStr: string): number {
    // Removes everything except digits, hyphens, and decimal points
    const cleanString = moneyStr.replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanString);
  }
}
