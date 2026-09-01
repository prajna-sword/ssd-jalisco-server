import { Test, TestingModule } from '@nestjs/testing';
import { GuestInquiriesService } from './guest-inquiries.service';

describe('GuestInquiriesService', () => {
  let service: GuestInquiriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuestInquiriesService],
    }).compile();

    service = module.get<GuestInquiriesService>(GuestInquiriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
