import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;


  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>, // 👈 Inject repository
    private configService: ConfigService,  
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

  async generateCheckoutIntent(bookingDetails: { nights: number; roomType: string }) {
    try {
      // 1. Calculate the true price securely on your server
      // (Do NOT pass price from frontend to prevent malicious price tempering)
      let pricePerNightUSD = 150; // Standard room default
      if (bookingDetails.roomType === 'luxury-suite') {
        pricePerNightUSD = 350;
      }

      const totalAmount = pricePerNightUSD * bookingDetails.nights;

      // 2. Stripe expects integers in the smallest currency unit (cents/sub-currency)
      // $100.50 USD becomes 10050 cents. (If using MXN, pesos also use cents)
      const amountInCents = Math.round(totalAmount * 100);

      // 3. Create the payment intent object on Stripe's cloud API
      const intent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'mxn', // or 'mxn' if pricing natively in Mexican Pesos

        // Highly recommended for elements: allows automatic support for card, Link, ApplePay, etc.
        automatic_payment_methods: {
          enabled: true,
        },

        // Optional metadata tracker to match Stripe dashboard entries to your local DB
        metadata: {
          hotelLocation: 'Jalisco_Mexico',
          roomType: bookingDetails.roomType,
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
}
