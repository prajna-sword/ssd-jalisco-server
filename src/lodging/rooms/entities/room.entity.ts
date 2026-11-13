import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn(
    'identity', {
    name: 'room_id',
    type: 'bigint',
  })
  roomId: string;

  @Column({
    name: 'client_page_id',
    type: 'bigint',
  })
  clientPageId: string;

  @Column({
    name: 'room_title',
    type: 'text',
  })
  roomTitle: string;

  @Column({
    name: 'room_description',
    type: 'text',
  })
  roomDescription: string;

  @Column({
    name: 'display_image_urls',
    type: 'text',
    array: true,
  })
  displayImageUrls: string[];

  @Column({
    name: 'room_quantity',
    type: 'int',
  })
  roomQuantity: number;

  @Column({
    name: 'nightly_rate',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  nightlyRate: number | null;

  @Column({
    name: 'weekly_rate',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  weeklyRate: number | null;

  @Column({
    name: 'monthly_rate',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  monthlyRate: number | null;

  @Column({
    name: 'pricing_mode',
    type: 'text',
  })
  pricingMode: string;

  @Column({
    name: 'room_amenities',
    type: 'text',
    array: true,
  })
  roomAmenities: string[];

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