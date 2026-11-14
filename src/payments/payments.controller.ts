import { Body, Controller, Get, Post } from '@nestjs/common';
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

}
