import { Test, TestingModule } from '@nestjs/testing';
import { StripeCheckoutSessionServiceService } from './stripe-checkout-session-service.service';

describe('StripeCheckoutSessionServiceService', () => {
  let service: StripeCheckoutSessionServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeCheckoutSessionServiceService],
    }).compile();

    service = module.get<StripeCheckoutSessionServiceService>(StripeCheckoutSessionServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
