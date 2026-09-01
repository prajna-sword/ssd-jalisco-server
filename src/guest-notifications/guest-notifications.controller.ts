import { Controller } from '@nestjs/common';
import { GuestNotificationsService } from './guest-notifications.service';

@Controller('guest-notifications')
export class GuestNotificationsController {
  constructor(private readonly guestNotificationsService: GuestNotificationsService) {}
}
