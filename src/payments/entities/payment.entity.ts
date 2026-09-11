import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  })
  bookingId: string;

  @Column({
    type: 'bigint',
    name: 'room_id',
  })
  roomId: string;

  @Column({
    type: 'money',
    name: 'payment_amount',
  })
  paymentAmount: string;

  @Column({
    type: 'text',
    name: 'stripe_payment_id',
  })
  stripePaymentId: string;

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