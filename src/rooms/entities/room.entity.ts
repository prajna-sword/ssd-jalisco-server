import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'room_id',
  })
  roomId: string;

  @Column({
    type: 'text',
    name: 'room_title',
  })
  roomTitle: string;

  @Column({
    type: 'text',
    name: 'room_description',
  })
  roomDescription: string;

  @Column({
    type: 'text',
    name: 'display_image_url',
  })
  displayImageUrl: string;

  @Column({
    type: 'money',
    name: 'nightly_rate',
  })
  nightlyRate: string;

  @Column({
    type: 'money',
    name: 'weekly_rate',
  })
  weeklyRate: string;

  @Column({
    type: 'text',
    name: 'image_alt_text',
    nullable: true,
  })
  imageAltText: string | null;

  @Column({
    type: 'text',
    array: true,
    name: 'more_images_url_list',
  })
  moreImagesUrlList: string[];

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
