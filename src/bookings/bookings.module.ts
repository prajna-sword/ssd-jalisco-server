import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { GuestsModule } from 'src/guests/guests.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { MultiBookingXREF } from './entities/multi-booking-xref.entity';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ClientPagesModule } from 'src/client-pages/client-pages.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, MultiBookingXREF]), 
    RoomsModule,
    ClientPagesModule,
    GuestsModule, 
    PaymentsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService]
})
export class BookingsModule { }
