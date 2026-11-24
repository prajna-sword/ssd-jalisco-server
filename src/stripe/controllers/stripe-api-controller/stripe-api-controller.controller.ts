import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { RoomSelection } from 'src/payments/dto/create-payment.dto';
import { StripeCheckoutSessionService } from 'src/stripe/services/stripe-checkout-session-service/stripe-checkout-session.service';
import { StripeConnectService } from 'src/stripe/services/stripe-connect-service/stripe-connect.service';
import { StripeCustomerService } from 'src/stripe/services/stripe-customer-service/stripe-customer.service';
import { StripePaymentService } from 'src/stripe/services/stripe-payment-service/stripe-payment.service';

@Controller('stripe')
export class StripeApiController {
    @Inject(StripePaymentService)
    private readonly stripePaymentService: StripePaymentService;
    @Inject(StripeCheckoutSessionService)
    private readonly stripeCheckoutSessionService: StripeCheckoutSessionService;
    @Inject(StripeConnectService)
    private readonly stripeConnectService: StripeConnectService;
    @Inject(StripeCustomerService)
    private readonly stripeCustomerService: StripeCustomerService;

    @Post('/create-intent/:clientPageId') // Enforces POST /payment/create-intent
    async createIntent(
        @Param('clientPageId') clientPageId: string,
        @Body() body: RoomSelection[]
    ) {
        return await this.stripePaymentService.generateCheckoutIntent(clientPageId, body);
    }

    // For manual capture feature
    @Post('/create-payment-qr')
    async createQrSession(@Body() body: { amount: number; productName: string }) {
        return this.stripeCheckoutSessionService.createMexicoCheckoutSession(body.amount, body.productName);
    }

    @Post('/create-hold-qr')
    async createHoldSession(@Body() body: { amount: number; productName: string }) {
        return this.stripeCheckoutSessionService.createHotelHoldSession(body.amount, body.productName);
    }

    @Post('/capture/:paymentIntentId')
    async captureHold(
        @Param('paymentIntentId') paymentIntentId: string,
        @Body() body: { amountToCapture?: number },
    ) {
        return this.stripePaymentService.captureHold(paymentIntentId, body.amountToCapture);
    }

    @Post('/release/:paymentIntentId')
    async releaseHold(@Param('paymentIntentId') paymentIntentId: string) {
        return this.stripePaymentService.releaseHold(paymentIntentId);
    }
}
