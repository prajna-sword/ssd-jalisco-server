import { Test, TestingModule } from '@nestjs/testing';
import { GuestInquiriesController } from './guest-inquiries.controller';
import { GuestInquiriesService } from './guest-inquiries.service';

describe('GuestInquiriesController', () => {
  let controller: GuestInquiriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestInquiriesController],
      providers: [GuestInquiriesService],
    }).compile();

    controller = module.get<GuestInquiriesController>(GuestInquiriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
