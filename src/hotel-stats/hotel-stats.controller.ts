import { Controller } from '@nestjs/common';
import { HotelStatsService } from './hotel-stats.service';

@Controller('hotel-stats')
export class HotelStatsController {
  constructor(private readonly hotelStatsService: HotelStatsService) {}
}
