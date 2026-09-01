import { Test, TestingModule } from '@nestjs/testing';
import { HotelStatsController } from './hotel-stats.controller';
import { HotelStatsService } from './hotel-stats.service';

describe('HotelStatsController', () => {
  let controller: HotelStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelStatsController],
      providers: [HotelStatsService],
    }).compile();

    controller = module.get<HotelStatsController>(HotelStatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
