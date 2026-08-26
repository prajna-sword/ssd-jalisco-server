import { Module } from '@nestjs/common';

import { BookingsModule } from './bookings/bookings.module';
import { EventsModule } from './events/events.module';
import { RoomsModule } from './rooms/rooms.module';
import { GuestsModule } from './guests/guests.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [BookingsModule, EventsModule, RoomsModule, GuestsModule, PaymentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
