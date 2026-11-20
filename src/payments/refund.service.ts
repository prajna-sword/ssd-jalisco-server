import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { differenceInMilliseconds } from 'date-fns';
import { ClientPagesService } from 'src/client/client-pages/client-pages.service';
import { BookingsService } from 'src/lodging/bookings/bookings.service';
import { NotificationsService } from 'src/notifications/notifications.service';
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
    private paymentsService: PaymentsService,
    private notificationService: NotificationsService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') as any, {
      apiVersion: '2026-08-26.dahlia' as any, // Standard modern Stripe API typing fallback
    });
  }

  // TODO -- apply refund policies and allow partial refunds
  async refundPayment(payload: RefundPaymentPayload): Promise<any> {
    const savedBooking = await this.bookingsService.findOne(payload.bookingId);
    if (savedBooking) {
      if (savedBooking.isCanceled) {
        throw new Error('Booking is already cancelled');
      }
      const now = new Date();
      const millisecondsSinceBooking = differenceInMilliseconds(now, savedBooking?.createdTimestamp as Date);
      const exactHours = millisecondsSinceBooking / 360000;
      const fiveDaysInHours = 24 * 5;
      const isWithinFiveDays = exactHours < fiveDaysInHours;

      const payment = await this.paymentsService.findByBookingId(payload.bookingId);


      const stripeResponse = await this.stripe.refunds.create({
        payment_intent: payment?.stripePaymentId,
        amount: this.moneyToNumber(payment?.paymentAmount as any) * 100 // total in cents
      });


      await this.paymentsService.refundPayment(payment?.stripePaymentId as string, payment?.paymentAmount as any);
      if (payload.bookedRoomIds.length === savedBooking.bookedRooms.length) {
        await this.bookingsService.cancelBooking(savedBooking);
      }
      await this.bookingsService.cancelBookedRooms(payload.bookedRoomIds);
      await this.notificationService.createBookingCancellationNotification(savedBooking);
      return stripeResponse;
    } else {
      throw new Error('No booking found for provided bookingId');
    }
  }

  moneyToNumber(moneyStr: string): number {
    // Removes everything except digits, hyphens, and decimal points
    const cleanString = moneyStr.replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanString);
  }
}
