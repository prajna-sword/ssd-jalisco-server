import { Test, TestingModule } from '@nestjs/testing';
import { StripeConnectServiceService } from './stripe-connect-service.service';

describe('StripeConnectServiceService', () => {
  let service: StripeConnectServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeConnectServiceService],
    }).compile();

    service = module.get<StripeConnectServiceService>(StripeConnectServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
