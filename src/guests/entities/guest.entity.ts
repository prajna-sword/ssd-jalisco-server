import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'guests' })
export class Guest {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'guest_id',
  })
  guestId: string;

  @Column({
    type: 'text',
    name: 'first_name',
  })
  firstName: string;

  @Column({
    type: 'text',
    name: 'last_name',
  })
  lastName: string;

  @Column({
    type: 'text',
    name: 'email_address',
  })
  emailAddress: string;

  @Column({
    type: 'text',
    name: 'phone_country_code',
  })
  phoneCountryCode: string;

  @Column({
    type: 'text',
    name: 'phone_local',
  })
  phoneLocal: string;

  @Column({
    type: 'text',
    name: 'phone_full_e164',
    asExpression: 'phone_country_code || phone_local',
    generatedType: 'STORED',
  })
  phoneFullE164: string;

  @Column({
    type: 'inet',
    name: 'guest_inet',
    nullable: true,
  })
  guestInet: string | null;

  @Column({
    type: 'text',
    name: 'guest_device_id',
    nullable: true,
  })
  guestDeviceId: string | null;

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
