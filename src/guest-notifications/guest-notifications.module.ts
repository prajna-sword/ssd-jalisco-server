import { Module } from '@nestjs/common';
import { GuestNotificationsService } from './guest-notifications.service';
import { GuestNotificationsController } from './guest-notifications.controller';

@Module({
  controllers: [GuestNotificationsController],
  providers: [GuestNotificationsService],
})
export class GuestNotificationsModule {}
