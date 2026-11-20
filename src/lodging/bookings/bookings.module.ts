import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientPagesModule } from 'src/client/client-pages/client-pages.module';
import { BookedRoom } from 'src/lodging/bookings/entities/booked-room.entity';
import { GuestsModule } from 'src/lodging/guests/guests.module';
import { RoomsModule } from 'src/lodging/rooms/rooms.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookedRoom]), 
    RoomsModule,
    ClientPagesModule,
    NotificationsModule,
    GuestsModule, 
    PaymentsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService]
})
export class BookingsModule { }
