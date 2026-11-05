export class CreatePaymentDto {}

export interface CreateIntentDto {
    checkInDate: Date;
    checkOutDate: Date;
    roomIds: String[];
}
