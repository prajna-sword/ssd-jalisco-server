import { Module } from '@nestjs/common';
import { ClientPagesModule } from 'src/client-pages/client-pages.module';
import { BookingsModule } from 'src/bookings/bookings.module';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';

@Module({
  imports: [ClientPagesModule, BookingsModule],
  controllers: [RefundController],
  providers: [RefundService]
})
export class PaymentsModule { }