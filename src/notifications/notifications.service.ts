import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Booking } from 'src/lodging/bookings/entities/booking.entity';
import { Guest } from 'src/lodging/guests/entities/guest.entity';
import { NotificationDto } from 'src/notifications/dto/notification.dto';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationOrigins, NotificationTypes } from 'src/notifications/enum/notification-constants.enum';
import { In, Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
    protected readonly DISPLAY_DATE_FORMAT = 'EEE, dd MMM yyyy';

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async markAsRead(notificationIds: string[]): Promise<Notification[]> {
        const matchingNotifications = await this.notificationRepository.find({
            where: {
                notificationId: In(notificationIds)
            }
        });

        matchingNotifications.forEach(notification => notification.isRead = true);
        return await this.notificationRepository.save(matchingNotifications);
    }

    async getClientPageNotifications(clientPageId: string): Promise<Notification[]> {
        return await this.notificationRepository.createQueryBuilder('notification')
            .where('notification.clientPageId = :clientPageId', { clientPageId })
            .getMany();
    }

    async getGuestConversation(bookingId: string): Promise<Notification[]> {
        return await this.notificationRepository.createQueryBuilder('notification')
            .where('notification.bookingId = :bookingId', { bookingId })
            .getMany();
    }

    async createBookingNotification(booking: Booking, guest: Guest): Promise<void> {
        let notificationText = `${guest.fullName} booked: `;

        for (let i = 0; i < booking.bookedRooms.length; i++) {
            const bR = booking.bookedRooms[i];
            if (i > 0) {
                notificationText += ',\n'
            }
            if (bR.roomQuantity > 1) {
                notificationText += `(${bR.roomQuantity}) ${bR.room.roomTitle}(s) `
            } else {
                notificationText += ` ${bR.room.roomTitle} `
            }
            notificationText += `${format(bR.checkInDate, this.DISPLAY_DATE_FORMAT)} - ${format(bR.checkOutDate, this.DISPLAY_DATE_FORMAT)}`
        }
        notificationText += '.';

        const notification: any = {
            clientPageId: booking.clientPageId,
            bookingId: booking.bookingId,
            guestId: booking.guestId,
            notificationOrigin: NotificationOrigins.GUEST,
            notificationType: NotificationTypes.NEW_BOOKING,
            notificationText,
            isRead: false,
        }
        await this.notificationRepository.save(notification);
    }

    async createBookingCancellationNotification(booking: Booking): Promise<void> {
        let notificationText = `${booking?.guest?.fullName} cancelled: `;

        for (let i = 0; i < booking.bookedRooms.length; i++) {
            const bR = booking.bookedRooms[i];
            if (i > 0) {
                notificationText += ',\n'
            }
            if (bR.roomQuantity > 1) {
                notificationText += `(${bR.roomQuantity}) ${bR.room.roomTitle}(s) `
            } else {
                notificationText += ` ${bR.room.roomTitle} `
            }
            notificationText += `${format(bR.checkInDate, this.DISPLAY_DATE_FORMAT)} - ${format(bR.checkOutDate, this.DISPLAY_DATE_FORMAT)}`
        }
        notificationText += '.';

        const notification: any = {
            clientPageId: booking.clientPageId,
            bookingId: booking.bookingId,
            guestId: booking.guestId,
            notificationOrigin: NotificationOrigins.GUEST,
            notificationType: NotificationTypes.BOOKING_CANCELLATION,
            notificationText,
            isRead: false,
        }
        await this.notificationRepository.save(notification);
    }

    async createGuestMessageNotification(payload: NotificationDto): Promise<Notification> {
        const notification: Notification = {
            ...payload,
            clientPage: null,
            guest: null,
            booking: null
        }
        return await this.notificationRepository.save(notification);
    }

    createAppMessageNotificaiton(notification: any): void {
        // TODO
    }
}
