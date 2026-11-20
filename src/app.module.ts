import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ClientPagesModule } from './client/client-pages/client-pages.module';
import { EmployeesModule } from './client/employees/employees.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './lodging/bookings/bookings.module';
import { GuestsModule } from './lodging/guests/guests.module';
import { RoomsModule } from './lodging/rooms/rooms.module';
import { PaymentsModule } from './payments/payments.module';
import { RefundModule } from './payments/refund.module';
import { WeatherModule } from './weather/weather.module';
import { NotificationsModule } from './notifications/notifications.module';

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
    EmployeesModule,
    RefundModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the module available everywhere
    }),
    ClientPagesModule,
    AuthModule,
    WeatherModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
