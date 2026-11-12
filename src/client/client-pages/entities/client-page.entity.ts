import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
// Assuming you have a Client entity defined elsewhere
// import { Client } from '../../clients/entities/client.entity'; 

@Entity({ name: 'client_pages' })
export class ClientPage {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'client_page_id' })
  clientPageId: string; // bigint is returned as a string in JavaScript/TypeScript to prevent precision loss

  @Column({ type: 'bigint', name: 'client_id' })
  clientId: string;

  @Column({ type: 'text', name: 'business_type' })
  businessType: 'H' | 'R' | 'E' | 'S' | 'L'; // Enforces your allowed comment types at the application level

  @Column({ type: 'text', name: 'card_title' })
  cardTitle: string;

  @Column({ type: 'text', name: 'card_subtitle' })
  cardSubtitle: string;

  @Column({ type: 'text', name: 'card_description' })
  cardDescription: string;

  @Column({ type: 'text', name: 'card_image_url' })
  cardImageUrl: string;

  @Column({ type: 'text', name: 'card_image_alt_text' })
  cardImageAltText: string;

  @Column({ type: 'text', name: 'business_name_route_segment' })
  businessNameRouteSegment: string;

  @Column({ name: 'detail_page_hero_title', type: 'text', nullable: true })
  detailPageHeroTitle: string;

  @Column({ name: 'detail_page_hero_subtitle', type: 'text', nullable: true })
  detailPageHeroSubtitle: string;

  @Column({ name: 'detail_page_hero_image_url', type: 'text', nullable: true })
  detailPageHeroImageUrl: string;

  @Column({ name: 'detail_page_business_description', type: 'text', nullable: true })
  detailPageBusinessDescription: string;

  @Column({ name: 'hotel_estimated_rate_low', type: 'numeric', precision: 10, scale: 2, nullable: true })
  hotelEstimatedRateLow: string;

  @Column({ name: 'hotel_estimated_rate_high', type: 'numeric', precision: 10, scale: 2, nullable: true })
  hotelEstimatedRateHigh: string;

  @Column({ name: 'hotel_amenities_list', type: 'text', array: true, nullable: true })
  hotelAmenitiesList: string[];

  @Column({
    type: 'boolean',
    name: 'allow_booking_cancellation',
    nullable: true,
    default: false,
  })
  allowBookingCancellation: boolean;

  @Column({ name: 'cancellation_flat_rate', type: 'numeric', precision: 10, scale: 2, nullable: true })
  cancellationFlatRate: string;

  @Column({ name: 'cancellation_percent_rate', type: 'smallint', nullable: true})
  cancellationPercentRate: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_timestamp' })
  createdTimestamp: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_timestamp' })
  updatedTimestamp: Date;

  // Optional: Uncomment this if you want to establish the relationship to your Clients entity
  // @ManyToOne(() => Client, (client) => client.clientPages)
  // @JoinColumn({ name: 'client_id' })
  // client: Client;
}
