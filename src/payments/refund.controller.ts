import { Body, Controller, Post } from '@nestjs/common';
import * as refundPaymentDto from './dto/refund-payment.dto';
import { RefundService } from './refund.service';

@Controller('payments')
export class RefundController {
  constructor(private readonly refundService: RefundService) { }

  @Post('create-refund')
  async createRefund(
    @Body() body: refundPaymentDto.RefundPaymentPayload
  ) {
    return await this.refundService.refundPayment(body);
  }
}
