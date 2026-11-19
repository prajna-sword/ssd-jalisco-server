import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 5000, // 5-second timeout so slow upstream calls don't hang your UI
      maxRedirects: 3,
    }),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule { }
