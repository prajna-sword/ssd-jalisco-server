export interface RoomSelection {
  roomIds: number[];
  checkInDate: Date;
  checkOutDate: Date;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneLocal: string;
  phoneCountryCode: string;
  numberOfGuests: number;
  checkInTime: string;
}

export interface BookingPayload {
  room: RoomSelection;
  guest: GuestDetails;
  currentTotal: number;
  paymentComplete: boolean;
}
