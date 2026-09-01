import { Test, TestingModule } from '@nestjs/testing';
import { HotelStatsService } from './hotel-stats.service';

describe('HotelStatsService', () => {
  let service: HotelStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HotelStatsService],
    }).compile();

    service = module.get<HotelStatsService>(HotelStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
