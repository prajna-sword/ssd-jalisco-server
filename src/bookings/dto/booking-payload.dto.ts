export interface RoomSelection {
  roomIds: number[];
  checkInDate: Date;
  checkOutDate: Date;
}

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
  room: RoomSelection;
  guest: GuestDetails;
  currentTotal: number;
  stripePaymentIntentId: string
  paymentComplete: boolean;
}
