import { Booking } from 'src/lodging/bookings/entities/booking.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('booked_rooms')
export class BookedRoom {
    @PrimaryGeneratedColumn('identity', { type: 'bigint', name: 'booked_room_id' })
    bookedRoomId: string;

    @ManyToOne(() => Booking, (booking) => booking.bookedRooms)
    @JoinColumn({ name: 'booking_id', referencedColumnName: 'bookingId' })
    booking: Booking;

    @Column({ type: 'bigint', name: 'booking_id'})
    bookingId: string;

    @Column({ type: 'bigint', name: 'client_page_id' })
    clientPageId: string;

    @Column({ type: 'bigint', name: 'guest_id' })
    guestId: string;

    @Column({ type: 'int', name: 'adult_guests' })
    adultGuests: number;

    @Column({ type: 'int', name: 'child_guests' })
    childGuests: number;

    @Column({ type: 'int', name: 'infant_guests' })
    infantGuests: number;

    @Column({ type: 'int', name: 'pet_guests' })
    petGuests: number;

    @Column({ type: 'int', name: 'room_quantity' })
    roomQuantity: number;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        name: 'booked_nightly_rate',
        nullable: true,
    })
    bookedNightlyRate: number | null;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        name: 'booked_weekly_rate',
        nullable: true,
    })
    bookedWeeklyRate: number | null;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        name: 'booked_monthly_rate',
        nullable: true,
    })
    bookedMonthlyRate: number | null;

    @Column({ type: 'date', name: 'check_in_date' })
    checkInDate: string;

    @Column({ type: 'date', name: 'check_out_date' })
    checkOutDate: string;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_timestamp',
        default: () => 'now()',
    })
    createdTimestamp: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_timestamp',
        default: () => 'now()',
    })
    updatedTimestamp: Date;
}