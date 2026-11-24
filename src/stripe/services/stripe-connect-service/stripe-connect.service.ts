import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeConnectService {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
        });
    }

    /**
 * Step 1 & 2: Creates an Express account (if not already created)
 * and generates a single-use hosted onboarding URL.
 */
    async createOnboardingLink(params: {
        hotelId: string;
        email: string;
        businessName: string;
        country?: string; // Defaults to 'MX'
        existingStripeAccountId?: string | null;
    }): Promise<{ stripeAccountId: string; onboardingUrl: string }> {
        let accountId = params.existingStripeAccountId;

        // 1. Create the Express account only if the hotel doesn't have one yet
        if (!accountId) {
            const account = await this.stripe.accounts.create({
                type: 'express',
                country: params.country || 'MX',
                email: params.email,
                business_type: 'company', // Or omit to let the hotel owner pick Individual vs. Company during onboarding
                company: {
                    name: params.businessName,
                },
                capabilities: {
                    transfers: { requested: true }, // Required for Separate Charges & Transfers
                    card_payments: { requested: true },
                },
                // Optional: Set payouts to 'manual' if YOU want to control when funds sweep from their Stripe balance to their bank
                // Otherwise, leave default ('daily') so any transfer you send automatically goes to their bank account.
                settings: {
                    payouts: {
                        schedule: {
                            interval: 'daily',
                        },
                    },
                },
                metadata: {
                    hotelId: params.hotelId,
                },
            });

            accountId = account.id;
            // TODO: Immediately save `accountId` onto your Hotel record in the DB before creating the link!
        }

        // 2. Generate a fresh, single-use Account Link (expires after a few minutes)
        const accountLink = await this.stripe.accountLinks.create({
            account: accountId,
            // If the link expires or the user clicks "Back", Stripe redirects here -> trigger a fresh link
            refresh_url: `${process.env.FRONTEND_URL}/dashboard/payouts/onboarding/refresh`,
            // Where Stripe redirects after they complete (or pause) the hosted form
            return_url: `${process.env.FRONTEND_URL}/dashboard/payouts/onboarding/complete`,
            type: 'account_onboarding',
        });

        return {
            stripeAccountId: accountId,
            onboardingUrl: accountLink.url,
        };
    }

    /**
     * Optional: Generates a login link to the Express Dashboard so hotels can view
     * their payouts, download tax invoices, or update their bank CLABE later.
     */
    async createExpressDashboardLink(stripeAccountId: string): Promise<string> {
        if (!stripeAccountId) {
            throw new BadRequestException('Hotel does not have a connected Stripe account');
        }

        const loginLink = await this.stripe.accounts.createLoginLink(stripeAccountId);
        return loginLink.url;
    }
}
