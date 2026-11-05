import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { RefundPaymentPayload } from './dto/refund-payment.dto';
import { ClientPagesService } from 'src/client-pages/client-pages.service';
import { BookingsService } from 'src/bookings/bookings.service';
import { differenceInDays, differenceInMilliseconds } from 'date-fns';
import { PaymentsService } from './payments.service';
import { Booking } from 'src/bookings/entities/booking.entity';

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

  // TODO -- refactor so that full refund isn't applied to one booking of multi-booking
  async refundPayment(payload: RefundPaymentPayload): Promise<any> {
    console.log(payload);
    // check if refund is within first 5 days 
    // use first bookingId since they will all be within milliseconds
    // if within first 5 days run the refund without an amount and stripe refunds total
    const savedBookingOne = await this.bookingsService.findOne(payload.bookingIds[0]);
    const now = new Date();
    const millisecondsSinceBooking = differenceInMilliseconds(now, savedBookingOne?.bookingTimestamp as Date);
    const exactHours = millisecondsSinceBooking / 360000;
    const fiveDaysInHours = 24 * 5;
    if (exactHours < fiveDaysInHours) {
      return await this.stripe.refunds.create({
        payment_intent: payload.paymentIntentId,
      });
    }

    let refundTotal = 0;
    let refundedBookings: Booking[] = [];
    for (const [index, bookingId] of payload.bookingIds) {
      console.log(index);
      console.log(bookingId)
      let savedBooking;
      if (index === '0') {
        savedBooking = savedBookingOne;
      } else {
        savedBooking = await this.bookingsService.findOne(bookingId);
      }
      refundedBookings.push(savedBooking);
      let diff = differenceInDays(savedBooking?.checkInDate as Date, savedBooking?.checkOutDate as Date);
      refundTotal += diff * this.moneyToNumber(savedBooking?.bookedRate as string);
    }

    const clientPage = await this.clientPagesService.findOne(payload.clientPageId);

    let flatRateDeduction = 0;
    let percentRateDeduction = 0;

    if (clientPage?.cancellationFlatRate) {
      flatRateDeduction = this.moneyToNumber(clientPage.cancellationFlatRate);
    }

    if (clientPage?.cancellationPercentRate) {
      percentRateDeduction = refundTotal * clientPage.cancellationPercentRate;
    }

    refundTotal = (refundTotal - (flatRateDeduction + percentRateDeduction));

    // TOOD -- ERROR HANDLING + LOGGING
    if (refundTotal !== this.moneyToNumber(payload.refundAmount)) {
      console.log('Expected refund total does not match computed total.');
    }

    // TOOD -- ERROR HANDLING + LOGGING
    if (refundTotal <= 0) {
      console.log('Computed Refund Amount is less than or equal to zero.')
    }

    console.log(refundTotal);

    const stripeResponse = await this.stripe.refunds.create({
      payment_intent: payload.paymentIntentId,
      amount: refundTotal * 100 // total in cents
    });
    
    // TODO - check response status

    await this.paymentsService.refundPayment(payload.paymentIntentId, refundTotal);
    
    for (let booking of refundedBookings){
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
