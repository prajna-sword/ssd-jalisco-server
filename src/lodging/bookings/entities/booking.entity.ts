import { Guest } from 'src/lodging/guests/entities/guest.entity';
import * as PaymentModule from 'src/payments/entities/payment.entity';
import * as typeorm from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookedRoom } from './booked-room.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('identity', { type: 'bigint', name: 'booking_id' })
  bookingId: string;

  @Column({ type: 'bigint', name: 'client_page_id' })
  clientPageId: string;

  @Column({ type: 'bigint', name: 'guest_id' })
  guestId: string;

  @ManyToOne(() => Guest, (guest) => guest.bookings)
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  @Column({
    type: 'text',
    name: 'payment_method_id',
    nullable: true
  })
  paymentMethodId: string;

  @Column({
    type: 'text',
    name: 'booking_status',
    nullable: true
  })
  bookingStatus: string;

  @Column({
    type: 'text',
    name: 'payment_method_preview',
    nullable: true
  })
  paymentMethodPreview: string;

  @Column({ type: 'boolean', name: 'is_canceled', default: false })
  isCanceled: boolean;

  @Column({
    type: 'timestamptz',
    name: 'cancellation_timestamp',
    nullable: true,
  })
  cancellationTimestamp: Date | null;

  @Column({ type: 'uuid', name: 'booking_uuid' })
  @Generated('uuid')
  bookingUuid: string;

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

  @OneToMany(() => BookedRoom, (bookedRoom) => bookedRoom.booking)
  bookedRooms: BookedRoom[];

  @OneToMany(() => PaymentModule.Payment, (payment) => payment.booking)
  payments: typeorm.Relation<PaymentModule.Payment[]>;
}