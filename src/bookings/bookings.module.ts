import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { GuestsModule } from 'src/guests/guests.module';
import { PaymentsModule } from 'src/payments/payments.module';


@Module({
  imports: [TypeOrmModule.forFeature([Booking]),
    GuestsModule, PaymentsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule { }
