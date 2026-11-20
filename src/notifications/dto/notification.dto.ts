import { PartialType } from "@nestjs/mapped-types";
import { ClientPage } from "src/client/client-pages/entities/client-page.entity";
import { Booking } from "src/lodging/bookings/entities/booking.entity";
import { Guest } from "src/lodging/guests/entities/guest.entity";

export class NotificationDto {
  notificationId: string;

  clientPageId: string | null;
  bookingId: string | null;
  guestId: string | null;

  notificationOrigin: string;
  notificationType: string;
  notificationText: string;

  isRead: boolean;

  createdTimestamp: Date;
  updatedTimestamp: Date;
}

export class PartialNotificationDto extends PartialType(NotificationDto) {
  
}

export interface NotificationWithRelationsDto extends NotificationDto {
  clientPage?: ClientPage | null;
  booking?: Booking | null;
  guest?: Guest | null;
}
