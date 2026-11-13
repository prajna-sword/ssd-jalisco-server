import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity('client_pages')
export class ClientPage {
  @PrimaryGeneratedColumn('identity', { type: 'bigint', name: 'client_page_id' })
  clientPageId: string;

  @Column({ type: 'bigint', name: 'client_id' })
  clientId: string;

  @Column({ type: 'text', name: 'business_type' })
  businessType: string;

  @Column({ type: 'text', name: 'business_name_route_segment' })
  businessNameRouteSegment: string;

  @Column({ type: 'boolean', name: 'display_page' })
  displayPage: boolean;

  @Column({ type: 'text', name: 'business_name', nullable: true })
  businessName: string | null;

  @Column({ type: 'text', name: 'short_description', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', name: 'search_display_image_url', nullable: true })
  searchDisplayImageUrl: string | null;

  @Column({ type: 'text', name: 'search_display_address', nullable: true })
  searchDisplayAddress: string | null;

  @Column({ type: 'text', name: 'search_display_place_id', nullable: true })
  searchDisplayPlaceId: string | null;

  @Column({ type: 'point', name: 'serach_display_coords', nullable: true })
  searchDisplayCoords: string | null;

  @Column({ type: 'text', name: 'detail_page_hero_image_url', nullable: true })
  detailPageHeroImageUrl: string | null;

  @Column({ type: 'text', array: true, name: 'detail_page_additional_image_urls', nullable: true })
  detailPageAdditionalImageUrls: string[] | null;

  @Column({ type: 'text', name: 'detail_page_business_description', nullable: true })
  detailPageBusinessDescription: string | null;

  @Column({ type: 'text', array: true, name: 'amenities_list', nullable: true })
  amenitiesList: string[] | null;

  @Column({ type: 'text', array: true, name: 'rules_list', nullable: true })
  rulesList: string[] | null;

  @Column({ type: 'text', array: true, name: 'custom_rules_list', nullable: true })
  customRulesList: string[] | null;

  @Column({ type: 'text', name: 'check_in_window', nullable: true })
  checkInWindow: string | null;

  @Column({ type: 'text', name: 'check_out_window', nullable: true })
  checkOutWindow: string | null;

  @Column({ type: 'text', array: true, name: 'safety_features', nullable: true })
  safetyFeatures: string[] | null;

  @Column({ type: 'text', name: 'safety_notes', nullable: true })
  safetyNotes: string | null;

  @Column({ type: 'text', name: 'booking_cancellation_policy', nullable: true })
  bookingCancellationPolicy: string | null;

  @Column({ type: 'boolean', name: 'allow_deferred_payments', nullable: true })
  allowDeferredPayments: boolean | null;

  @Column({ type: 'boolean', name: 'allow_multi_bookings', nullable: true })
  allowMultiBookings: boolean | null;

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
}