import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RefundPaymentPayload } from './dto/refund-payment.dto';
import { RefundService } from './refund.service';

@Controller('payments')
export class RefundController {
  constructor(private readonly refundService: RefundService) { }

  @Post('create-refund') // Enforces POST /payment/create-refund
  async createRefund(
    @Body() body: RefundPaymentPayload
  ) {
    return await this.refundService.refundPayment(body);
  }
}
