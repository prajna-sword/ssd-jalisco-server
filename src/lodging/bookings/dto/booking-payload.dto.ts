import { RoomSelection } from "src/payments/dto/create-payment.dto";

export interface GuestDetails {
  guestName: string;
  emailAddress: string;
  phoneNumber: string;
  numberOfGuests: number;
  checkInTime: string;
  guestBillingAddress: GuestAddress;
}

export interface GuestAddress {
  city: string;
  line1: string;
  line2: string;
  postalCode: string;
  state: string;
  country: string;
}

export interface BookingPayload {
  rooms: RoomSelection[];
  guest: GuestDetails;
  currentTotal: number;
  stripePaymentIntentId: string | null;
  clientPageId: string;
  paymentComplete: boolean;
}
