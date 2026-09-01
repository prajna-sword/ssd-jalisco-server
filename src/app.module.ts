import { Module } from '@nestjs/common';

import { BookingsModule } from './bookings/bookings.module';
import { EventsModule } from './events/events.module';
import { RoomsModule } from './rooms/rooms.module';
import { GuestsModule } from './guests/guests.module';
import { PaymentsModule } from './payments/payments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestInquiriesModule } from './guest-inquiries/guest-inquiries.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [BookingsModule, EventsModule, RoomsModule, GuestsModule, PaymentsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'mypassword',
      database: 'mydb',
      autoLoadEntities: true,
      synchronize: true, // Remember to turn this OFF in production!
    }),
    GuestInquiriesModule,
    EmployeesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
