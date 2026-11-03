import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Generated
} from 'typeorm';


@Entity('multi_booking_xref')
export class MultiBookingXREF {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'multi_booking_xref_id' })
    multiBookingXrefId: string; // bigint is handled as a string in JS/TS to prevent precision loss

    @Column({ type: 'bigint', name: 'guest_id' })
    guestId: string;

    @Column({ type: 'bigint', name: 'client_page_id' })
    clientPageId: string;

    @Column({ type: 'uuid', name: 'multi_booking_uuid' })
    @Generated('uuid')
    multiBookingUUID: string;

    @CreateDateColumn({ type: 'timestamptz', name: 'booking_timestamp' })
    bookingTimestamp: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_timestamp' })
    updatedTimestamp: Date;
}