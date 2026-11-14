import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInCalendarDays } from 'date-fns';
import { Room } from 'src/lodging/rooms/entities/room.entity';
import { RoomsService } from 'src/lodging/rooms/rooms.service';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { CreateIntentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';


@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private rooms: Room[] = [];


  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>, // 👈 Inject repository
    private configService: ConfigService,
    private roomService: RoomsService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') as any, {
      apiVersion: '2026-08-26.dahlia' as any, // Standard modern Stripe API typing fallback
    });
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find();
  }

  async findOne(id: string): Promise<Payment | null> {
    return await this.paymentRepository.findOneBy({ paymentId: id });
  }

  async save(payment: Payment): Promise<Payment | null> {
    return await this.paymentRepository.save(payment);
  }

  async findByXrefId(xrefId: string): Promise<Payment | null> {
    return await this.paymentRepository.createQueryBuilder('payment')
      .where('payment.multiBookingXrefId = :xrefId', { xrefId })
      .getOne();
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    return await this.paymentRepository.createQueryBuilder('payment')
      .where('payment.bookingId = :bookingId', { bookingId })
      .getOne();
  }

  // Methods for the client manual payment capture feature
  async createMexicoCheckoutSession(amountInCentavos: number, productName: string) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: productName,
            },
            // Stripe expects amounts in centavos (e.g., 15000 = $150.00 MXN)
            unit_amount: amountInCentavos,
          },
          quantity: 1,
        },
      ],
      payment_method_options: {
        oxxo: {
          expires_after_days: 3, // Optional: 1 to 7 days
        },
      },
      success_url: 'https://yourdomain.com{CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourdomain.com',
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  // 1. Create a Checkout Session that places a hold on funds
  async createHotelHoldSession(holdAmountInCentavos: number, productName: string) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: productName,
            },
            unit_amount: holdAmountInCentavos,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: 'manual', // Places a hold instead of charging immediately
        metadata: {
          productName,
        },
      },
      success_url: 'https://yourdomain.com{CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourdomain.com',
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
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

  async refundPayment(paymentIntentId: string, refundAmount: number): Promise<void> {
    const savedPayment = await this.paymentRepository.createQueryBuilder('payment')
      .where('payment.stripePaymentId = :paymentIntentId', { paymentIntentId })
      .getOne();
    if (savedPayment) {
      savedPayment.isRefunded = true;
      savedPayment.refundTimestamp = new Date();
      savedPayment.refundedAmount = refundAmount as unknown as string;
      this.paymentRepository.save(savedPayment);
    }
  }

  // TODO -- verify that the current calculation method is safe since the amount of 
  // days will have to be passed from the UI and it could be mutable?
  async generateCheckoutIntent(bookingDetails: CreateIntentDto) {
    const nights = differenceInCalendarDays(bookingDetails.checkOutDate, bookingDetails.checkInDate);

    try {
      if (this.rooms.length === 0) {
        this.rooms = await this.roomService.findAll();
      }
      let bookedRooms: Room[] = [];
      for (let roomId of bookingDetails.roomIds) {
        this.rooms.forEach(room => {
          if (room.roomId === roomId) {
            bookedRooms.push(room);
          }
        });
      }
      let totalAmount = 0;
      bookedRooms.forEach(room => {
        totalAmount += (room.nightlyRate as any * nights)
      });

      // 2. Stripe expects integers in the smallest currency unit (cents/sub-currency)
      // $100.50 USD becomes 10050 cents. (If using MXN, pesos also use cents)
      const amountInCents = Math.round(totalAmount * 100);

      let roomIdString = '';
      bookingDetails.roomIds.forEach(roomId => {
        roomIdString += roomId;
        roomIdString += ','
      });

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
        metadata: {
          hotelLocation: 'Jalisco_Mexico',
          roomIds: roomIdString,
          totalNights: nights.toString(),
        },
      });

      // 4. Return the unique client secret safely back to the client app
      return {
        clientSecret: intent.client_secret,
        totalAmountUSD: totalAmount,
      };

    } catch (error) {
      throw new BadRequestException(`Stripe Intent failed: ${(error as Error).message}`);
    }
  }

  moneyToNumber(moneyStr: string): number {
    // Removes everything except digits, hyphens, and decimal points
    const cleanString = moneyStr.replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanString);
  }
}
