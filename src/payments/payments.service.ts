import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { RoomsService } from 'src/rooms/rooms.service';
import { Room } from 'src/rooms/entities/room.entity';

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
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY') as any, {
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

  async generateCheckoutIntent(bookingDetails: { nights: number; roomIds: string[] }) {
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
        totalAmount += (this.moneyToNumber(room.nightlyRate) * bookingDetails.nights)
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
          totalNights: bookingDetails.nights.toString(),
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
