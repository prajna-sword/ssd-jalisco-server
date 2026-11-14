import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import * as createPaymentDto from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Post('create-intent') // Enforces POST /payment/create-intent
  async createIntent(
    @Body() body: createPaymentDto.CreateIntentDto
  ) {
    return await this.paymentsService.generateCheckoutIntent(body);
  }

  // For manual capture feature
  @Post('create-payment-qr')
  async createQrSession(@Body() body: { amount: number; productName: string }) {
    return this.paymentsService.createMexicoCheckoutSession(body.amount, body.productName);
  }

  @Post('create-hold-qr')
  async createHoldSession(@Body() body: { amount: number; productName: string }) {
    return this.paymentsService.createHotelHoldSession(body.amount, body.productName);
  }

  @Post('capture/:paymentIntentId')
  async captureHold(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() body: { amountToCapture?: number },
  ) {
    return this.paymentsService.captureHold(paymentIntentId, body.amountToCapture);
  }

  @Post('release/:paymentIntentId')
  async releaseHold(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.releaseHold(paymentIntentId);
  }
}
