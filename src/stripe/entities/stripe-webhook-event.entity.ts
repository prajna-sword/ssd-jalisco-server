import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('stripe_webhook_events')
export class StripeWebhookEventEntity {
  @PrimaryColumn({ name: 'event_id', type: 'varchar', length: 255 })
  eventId: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ type: 'varchar', length: 50, default: 'processing' })
  status: 'processing' | 'processed' | 'failed';

  @Column({ name: 'account_id', type: 'varchar', length: 255, nullable: true })
  accountId: string | null;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}