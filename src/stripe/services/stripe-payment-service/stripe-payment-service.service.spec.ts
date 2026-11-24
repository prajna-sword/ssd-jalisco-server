import { Test, TestingModule } from '@nestjs/testing';
import { StripePaymentServiceService } from './stripe-payment-service.service';

describe('StripePaymentServiceService', () => {
  let service: StripePaymentServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripePaymentServiceService],
    }).compile();

    service = module.get<StripePaymentServiceService>(StripePaymentServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
