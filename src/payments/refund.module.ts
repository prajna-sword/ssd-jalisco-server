import { Module } from '@nestjs/common';
import { ClientPagesModule } from 'src/client/client-pages/client-pages.module';
import { BookingsModule } from 'src/lodging/bookings/bookings.module';
import { PaymentsModule } from './payments.module';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';

@Module({
  imports: [ClientPagesModule, BookingsModule, PaymentsModule],
  controllers: [RefundController],
  providers: [RefundService]
})
export class RefundModule { }