import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import * as createPaymentDto from './dto/create-payment.dto';

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
}
