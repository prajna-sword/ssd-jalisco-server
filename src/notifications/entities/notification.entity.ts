import { ClientPage } from 'src/client/client-pages/entities/client-page.entity';
import { Booking } from 'src/lodging/bookings/entities/booking.entity';
import { Guest } from 'src/lodging/guests/entities/guest.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('identity', {
        name: 'notification_id',
        type: 'bigint',
    })
    notificationId: string;

    @Column({
        name: 'client_page_id',
        type: 'bigint',
        nullable: true,
    })
    clientPageId: string | null;

    @ManyToOne(() => ClientPage, { nullable: true })
    @JoinColumn({ name: 'client_page_id' })
    clientPage: ClientPage | null;

    @Column({
        name: 'notification_origin',
        type: 'text',
    })
    notificationOrigin: string;

    @Column({
        name: 'notification_type',
        type: 'text',
    })
    notificationType: string;

    @Column({
        name: 'notification_text',
        type: 'text',
    })
    notificationText: string;

    @Column({
        name: 'guest_id',
        type: 'bigint',
        nullable: true,
    })
    guestId: string | null;

    @ManyToOne(() => Guest, { nullable: true })
    @JoinColumn({ name: 'guest_id' })
    guest: Guest | null;

    @Column({
        name: 'booking_id',
        type: 'bigint',
        nullable: true,
    })
    bookingId: string | null;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking | null;

    @Column({
        name: 'is_read',
        type: 'boolean',
        default: false,
    })
    isRead: boolean;

    @CreateDateColumn({
        name: 'created_timestamp',
        type: 'timestamp',
        default: () => 'now()',
    })
    createdTimestamp: Date;

    @UpdateDateColumn({
        name: 'updated_timestamp',
        type: 'timestamp',
        default: () => 'now()',
    })
    updatedTimestamp: Date;
}