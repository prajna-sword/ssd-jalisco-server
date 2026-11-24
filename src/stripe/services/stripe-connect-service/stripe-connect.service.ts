import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/clients/entities/client.entity';
import { ConnectAccountStatus } from 'src/stripe/models/helpers.interface';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

@Injectable()
export class StripeConnectService {
    private readonly stripe: Stripe;

    constructor(
        @InjectRepository(Client)
        private readonly clientRepo: Repository<Client>,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: process.env.STRIPE_API_VERSION as any, // Use your dashboard's pinned API version
        });
    }

    /**
 * Step 1 & 2: Creates an Express account (if not already created)
 * and generates a single-use hosted onboarding URL.
 */
    async createOnboardingLink(params: {
        clientId: string;
        email: string;
        businessName: string;
        country?: string; // Defaults to 'MX'
        existingStripeAccountId?: string | null;
    }): Promise<{ stripeAccountId: string; onboardingUrl: string }> {
        console.log(params);
        let accountId = params.existingStripeAccountId;

        // 1. Create the Express account only if the hotel doesn't have one yet
        if (!accountId) {
            const account = await this.stripe.v2.core.accounts.create({
                contact_email: params.email,
                display_name: params.businessName,
                dashboard: 'express', // Gives them the Stripe Express dashboard
                identity: {
                    country: 'mx', // Mexico
                },
                configuration: {
                    recipient: {
                        capabilities: {
                            stripe_balance: {
                                stripe_transfers: { requested: true },
                            },
                        },
                    }
                },
                defaults: {
                    currency: 'mxn',
                    responsibilities: {
                        fees_collector: 'application', // Platform collects fees (standard for Express)
                        losses_collector: 'application', // Platform manages disputes/negative balances
                    },
                },
            });

            accountId = account.id;
            await this.clientRepo.update(params.clientId, {
                stripeAccountId: accountId
            });
        }

        // 2. Generate the Account Link using Account Links v2
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4200';
        const accountLink = await this.stripe.v2.core.accountLinks.create({
            account: accountId,
            use_case: {
                type: 'account_onboarding',
                account_onboarding: {
                    configurations: ['recipient'],
                    refresh_url: `${frontendUrl}/settings&refresh=true`,
                    return_url: `${frontendUrl}/settings&return=true`,
                    collection_options: {
                        fields: 'currently_due',
                    },
                },
            },
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
            throw new BadRequestException('Client does not have a connected Stripe account');
        }

        const loginLink = await this.stripe.accounts.createLoginLink(stripeAccountId);
        return loginLink.url;
    }

    async syncAndGetAccountStatus(clientId: string): Promise<ConnectAccountStatus> {
        const client = await this.clientRepo.findOne({
            where: { clientId },
        });

        if (!client) {
            throw new NotFoundException('Client record not found');
        }

        // If they haven't even created a Stripe Connect account ID yet
        if (!client.stripeAccountId) {
            return {
                detailsSubmitted: false,
                chargesEnabled: false,
                payoutsEnabled: false,
            };
        }

        // 1. Fetch fresh status directly from Stripe API
        const account = await this.stripe.accounts.retrieve(client.stripeAccountId);

        const status: ConnectAccountStatus = {
            detailsSubmitted: Boolean(account.details_submitted),
            chargesEnabled: Boolean(account.charges_enabled),
            payoutsEnabled: Boolean(account.payouts_enabled),
        };

        // 2. Sync to your local DB right away (acts as a fallback before account.updated arrives)
        await this.clientRepo.update(client.clientId, {
            stripeOnboardingComplete: status.detailsSubmitted,
            stripeChargesEnabled: status.chargesEnabled,
            stripePayoutsEnabled: status.payoutsEnabled,
        });

        return status;
    }
}
