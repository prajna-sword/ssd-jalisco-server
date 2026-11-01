import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  eventId: string;

  @Column({ type: 'bigint', name: 'client_id' })
  clientId: string;

  @Column({ type: 'text', name: 'event_title' })
  eventTitle: string;

  @Column({ type: 'text', name: 'event_description' })
  eventDescription: string;

  @Column({ type: 'text', name: 'event_image_url' })
  eventImageUrl: string;

  @Column({ type: 'text', name: 'event_image_alt_text' })
  eventImageAltText: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', name: 'end_date' })
  endDate: string;

  @Column({ type: 'time', name: 'start_time', nullable: true })
  startTime: string | null;

  @Column({ type: 'time', name: 'end_time', nullable: true })
  endTime: string | null;

  @Column({ type: 'text', name: 'location_url', nullable: true })
  locationUrl: string | null;

  @Column({ type: 'text', name: 'location_title' })
  locationTitle: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_timestamp',
  })
  createdTimestamp: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_timestamp',
  })
  updatedTimestamp: Date;
}
