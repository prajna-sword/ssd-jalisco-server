import { Test, TestingModule } from '@nestjs/testing';
import { GuestNotificationsController } from './guest-notifications.controller';
import { GuestNotificationsService } from './guest-notifications.service';

describe('GuestNotificationsController', () => {
  let controller: GuestNotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestNotificationsController],
      providers: [GuestNotificationsService],
    }).compile();

    controller = module.get<GuestNotificationsController>(GuestNotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
