import { Module } from '@nestjs/common';
import { ClientPagesModule } from 'src/client/client-pages/client-pages.module';
import { BookingsModule } from 'src/lodging/bookings/bookings.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PaymentsModule } from './payments.module';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';

@Module({
  imports: [ClientPagesModule, BookingsModule, PaymentsModule, NotificationsModule],
  controllers: [RefundController],
  providers: [RefundService]
})
export class RefundModule { }