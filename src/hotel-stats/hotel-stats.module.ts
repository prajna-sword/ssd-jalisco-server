import { Module } from '@nestjs/common';
import { HotelStatsService } from './hotel-stats.service';
import { HotelStatsController } from './hotel-stats.controller';

@Module({
  controllers: [HotelStatsController],
  providers: [HotelStatsService],
})
export class HotelStatsModule {}
