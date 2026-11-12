import { Test, TestingModule } from '@nestjs/testing';
import { ClientPagesController } from './client-pages.controller';
import { ClientPagesService } from './client-pages.service';

describe('ClientPagesController', () => {
  let controller: ClientPagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientPagesController],
      providers: [ClientPagesService],
    }).compile();

    controller = module.get<ClientPagesController>(ClientPagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
