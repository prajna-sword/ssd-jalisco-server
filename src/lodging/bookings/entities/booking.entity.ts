import { Guest } from 'src/lodging/guests/entities/guest.entity';
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

  @ManyToOne(() => Guest, { nullable: true })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest | null;

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
}