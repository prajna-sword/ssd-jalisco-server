import { Test, TestingModule } from '@nestjs/testing';
import { StripeApiControllerController } from './stripe-api-controller.controller';

describe('StripeApiControllerController', () => {
  let controller: StripeApiControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeApiControllerController],
    }).compile();

    controller = module.get<StripeApiControllerController>(StripeApiControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
