import * as BookingModule from 'src/lodging/bookings/entities/booking.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import * as typeorm from 'typeorm';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'payment_id',
  })
  paymentId: string;

  @Column({
    type: 'text',
    name: 'payment_type',
  })
  paymentType: string;

  @Column({
    type: 'bigint',
    name: 'guest_id',
  })
  guestId: string;

  @Column({
    type: 'bigint',
    name: 'booking_id',
    nullable: true
  })
  bookingId: string;

  @ManyToOne(() => BookingModule.Booking, (booking) => booking.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: typeorm.Relation<BookingModule.Booking>;

  @Column({
    type: 'money',
    name: 'intent_amount',
  })
  intentAmount: string;

  @Column({
    type: 'money',
    name: 'captured_amount',
    nullable: true
  })
  capturedAmount: string;

  @Column({
    type: 'money',
    name: 'net_client_amount',
    nullable: true
  })
  netClientAmount: string;

  @Column({
    type: 'text',
    name: 'payment_intent_id',
  })
  paymentIntentId: string;

  @Column({
    type: 'text',
    name: 'payment_status',
  })
  paymentStatus: string;

  @Column({
    type: 'text',
    name: 'failure_reason',
    nullable: true
  })
  failureReason: string;

  @Column({
    type: 'text',
    name: 'dispute_id',
    nullable: true
  })
  disputeId: string;

  @Column({
    type: 'boolean',
    name: 'is_refunded',
    default: false,
  })
  isRefunded: boolean;

  @Column({
    type: 'money',
    name: 'refunded_amount',
    nullable: true,
  })
  refundedAmount: string | null;

  @Column({ type: 'timestamptz', name: 'refund_timestamp', nullable: true })
  refundTimestamp: Date;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'transaction_timestamp',
  })
  transactionTimestamp: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_timestamp',
  })
  updatedTimestamp: Date;
}