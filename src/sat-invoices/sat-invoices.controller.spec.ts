import { Test, TestingModule } from '@nestjs/testing';
import { SatInvoicesController } from './sat-invoices.controller';
import { SatInvoicesService } from './sat-invoices.service';

describe('SatInvoicesController', () => {
  let controller: SatInvoicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SatInvoicesController],
      providers: [SatInvoicesService],
    }).compile();

    controller = module.get<SatInvoicesController>(SatInvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
