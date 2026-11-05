import { Module } from '@nestjs/common';
import { ClientPagesModule } from 'src/client-pages/client-pages.module';
import { BookingsModule } from 'src/bookings/bookings.module';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';
import { PaymentsModule } from './payments.module';

@Module({
  imports: [ClientPagesModule, BookingsModule, PaymentsModule],
  controllers: [RefundController],
  providers: [RefundService]
})
export class RefundModule { }