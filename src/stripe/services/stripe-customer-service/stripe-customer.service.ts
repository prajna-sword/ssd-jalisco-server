import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeCustomerService {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
        });
    }

    async createCustomer(name: string, email: string, phone: string): Promise<string> {
        const customer = await this.stripe.customers.create({
            email,
            name,
            phone
        })
        return customer.id;
    }

}
