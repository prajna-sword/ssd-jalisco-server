import { Test, TestingModule } from '@nestjs/testing';
import { ClientPagesService } from './client-pages.service';

describe('ClientPagesService', () => {
  let service: ClientPagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientPagesService],
    }).compile();

    service = module.get<ClientPagesService>(ClientPagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
