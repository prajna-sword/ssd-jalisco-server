import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
    @Body() body: { nights: number; roomIds: string[] }
  ) {
    return await this.paymentsService.generateCheckoutIntent(body);
  }
}
