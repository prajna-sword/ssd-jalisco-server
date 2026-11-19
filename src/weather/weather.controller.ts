// weather.controller.ts
import { Controller, Get } from '@nestjs/common';
import { RegionalWeatherResponse } from 'src/weather/dto/weather.dto';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('jalisco-coast-sierra')
  async getJaliscoWeather(): Promise<RegionalWeatherResponse> {
    return this.weatherService.getRegionalWeather();
  }
}
