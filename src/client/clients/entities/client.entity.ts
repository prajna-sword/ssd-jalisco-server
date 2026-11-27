import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import * as typeorm from 'typeorm';
import * as clientPageModule from '../../client-pages/entities/client-page.entity';


@Entity('clients')
export class Client {
    @PrimaryGeneratedColumn('identity', { type: 'bigint', name: 'client_id' })
    clientId: string;

    @Column({ type: 'text', name: 'client_name', nullable: true })
    clientName: string | null;

    @Column({
        name: 'stripe_account_id',
        type: 'varchar',
        length: 255,
        unique: true,
        nullable: true,
    })
    stripeAccountId: string | null;

    @Column({
        name: 'stripe_onboarding_complete',
        type: 'boolean',
        default: false,
    })
    stripeOnboardingComplete: boolean;

    @Column({
        name: 'stripe_charges_enabled',
        type: 'boolean',
        default: false,
    })
    stripeChargesEnabled: boolean;

    @Column({
        name: 'stripe_payouts_enabled',
        type: 'boolean',
        default: false,
    })
    stripePayoutsEnabled: boolean;

    @Column({
        name: 'stripe_requirements_due',
        type: 'jsonb',
        default: () => "'[]'",
    })
    stripeRequirementsDue: string[];

    @Column({
        name: 'stripe_account_closed',
        type: 'boolean',
        default: false,
    })
    stripeAccountClosed: boolean;

    @Column({ type: 'text', name: 'disabled_reason', nullable: true })
    disabledReason: string | null;

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

    @OneToMany(() => clientPageModule.ClientPage, (clientPage) => clientPage.client)
    clientPages: typeorm.Relation<clientPageModule.ClientPage>;
}
