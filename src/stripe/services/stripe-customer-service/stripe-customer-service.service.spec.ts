import { Test, TestingModule } from '@nestjs/testing';
import { StripeCustomerServiceService } from './stripe-customer-service.service';

describe('StripeCustomerServiceService', () => {
  let service: StripeCustomerServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeCustomerServiceService],
    }).compile();

    service = module.get<StripeCustomerServiceService>(StripeCustomerServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
