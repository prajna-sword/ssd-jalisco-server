import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Generated
} from 'typeorm';


@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'booking_id' })
  bookingId: string; // bigint is handled as a string in JS/TS to prevent precision loss

  @Column({ type: 'bigint', name: 'client_page_id' })
  clientPageId: string;

  @Column({ type: 'bigint', name: 'guest_id' })
  guestId: string;

  @Column({ type: 'bigint', name: 'room_id' })
  roomId: string;

  @Column({ type: 'bigint', name: 'multi_booking_xref_id', nullable: true })
  multiBookingXrefId: string;

  @Column({ type: 'date', name: 'check_in_date' })
  checkInDate: Date;

  @Column({ type: 'date', name: 'check_out_date' })
  checkOutDate: Date;

  @Column({ type: 'smallint', name: 'number_of_guests' })
  numberOfGuests: number;

  @Column({ type: 'boolean', name: 'is_canceled', default: false })
  isCanceled: boolean;

  @Column({ type: 'timestamptz', name: 'cancellation_timestamp', nullable: true })
  cancellationTimestamp: Date;

  @Column({ type: 'time', name: 'check_in_time' })
  checkInTime: string; // Time types are typically handled as string ("HH:MM:SS")

  @Column({ type: 'time', name: 'check_out_time', nullable: true })
  checkOutTime: string | null;

  // Necessary because client can change room rate
  // We need the booked rate to calculate partial refunds of multi-bookings
  @Column({
    type: 'money',
    name: 'booked_rate',
  })
  bookedRate: string;

  @Column({ type: 'uuid', name: 'booking_uuid' })
  @Generated('uuid')
  bookingUUID: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'booking_timestamp' })
  bookingTimestamp: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_timestamp' })
  updatedTimestamp: Date;
}
