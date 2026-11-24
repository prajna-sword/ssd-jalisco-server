import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeCheckoutSessionService {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
        });
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
}
