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
    name: 'full_name',
  })
  fullName: string;

  @Column({
    type: 'text',
    name: 'email_address',
  })
  emailAddress: string;

  @Column({
    type: 'text',
    name: 'phone_number',
  })
  phoneNumber: string;

  @Column({
    type: 'text',
    name: 'addr_line_one',
  })
  addrLineOne: string;

  @Column({
    type: 'text',
    name: 'addr_line_two',
  })
  addrLineTwo: string;

  @Column({
    type: 'text',
    name: 'addr_city',
  })
  addrCity: string;

  @Column({
    type: 'text',
    name: 'addr_state_or_province',
  })
  addrStateOrProvince: string;

  @Column({
    type: 'text',
    name: 'addr_country',
  })
  addrCountry: string;

  @Column({
    type: 'text',
    name: 'addr_zip_code',
  })
  addrZipCode: string;

  @Column({
    type: 'text',
    name: 'stripe_cust_id',
  })
  stripeCustId: string;

  @Column({ 
    type: 'boolean', 
    name: 'preferred_guest', 
    default: false 
  })
  isPreferredGuest: boolean;

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
