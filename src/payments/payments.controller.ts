import { Controller, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('/:clientPageId')
  getClientPagePayments(@Param('clientPageId') clientPageId: string) {
    return this.paymentsService.getClientPagePayments(clientPageId);
  }

  @Get('/:paymentId/detail')
  getPaymentDetails(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getPaymentDetail(paymentId);
  }
}
