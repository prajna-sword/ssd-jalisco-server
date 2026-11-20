import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import * as notificationDto from 'src/notifications/dto/notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get('/:bookingId/conversation')
  async getBookingGuestConversation(
    @Param('bookingId') bookingId: string,
  ) {
    return this.notificationsService.getGuestConversation(bookingId);
  }

  @Get('/:clientPageId')
  async getClientPageNotifications(
    @Param('clientPageId') clientPageId: string,
  ) {
    return this.notificationsService.getClientPageNotifications(clientPageId);
  }

  @Patch('/read')
  updateClientPage(@Body() notificationIds: string[]) {
    return this.notificationsService.markAsRead(notificationIds);
  }

  @Post('/message')
  create(@Body() notification: notificationDto.NotificationDto) {
    return this.notificationsService.createGuestMessageNotification(notification);
  }
}
