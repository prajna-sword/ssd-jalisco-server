import { Test, TestingModule } from '@nestjs/testing';
import { SatInvoicesService } from './sat-invoices.service';

describe('SatInvoicesService', () => {
  let service: SatInvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatInvoicesService],
    }).compile();

    service = module.get<SatInvoicesService>(SatInvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
