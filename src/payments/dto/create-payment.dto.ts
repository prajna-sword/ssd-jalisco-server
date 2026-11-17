export class CreatePaymentDto {}

export interface CreateIntentDto {
    checkInDate: Date;
    checkOutDate: Date;
    roomIds: String[];
}

export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface RoomSelection {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  quantity: number;
  guestCount: GuestCount;
}
