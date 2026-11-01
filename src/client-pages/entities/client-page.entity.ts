import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
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

  @CreateDateColumn({ type: 'timestamp', name: 'created_timestamp' })
  createdTimestamp: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_timestamp' })
  updatedTimestamp: Date;

  // Optional: Uncomment this if you want to establish the relationship to your Clients entity
  // @ManyToOne(() => Client, (client) => client.clientPages)
  // @JoinColumn({ name: 'client_id' })
  // client: Client;
}
