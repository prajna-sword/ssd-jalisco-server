import { Test, TestingModule } from '@nestjs/testing';
import { StripeCheckoutSessionService } from './stripe-checkout-session.service';

describe('StripeCheckoutSessionService', () => {
  let service: StripeCheckoutSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeCheckoutSessionService],
    }).compile();

    service = module.get<StripeCheckoutSessionService>(StripeCheckoutSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
