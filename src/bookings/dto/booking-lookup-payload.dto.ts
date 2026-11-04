import { Payment } from "src/payments/entities/payment.entity";
import { Guest } from "src/guests/entities/guest.entity";
import { ClientPage } from "src/client-pages/entities/client-page.entity";

export class BookingDetails {
    bookingId: string;
    multiBookingXrefId: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    isCanceled: boolean;
    checkInTime: string;
    checkOutTime: string | null;
    bookingUUID: string;
    bookingTimestamp: Date;
    updatedTimestamp: Date;
    bookedRoom: BookedRoom | null;
}

export class BookedRoom {
    roomId: string;
    roomTitle: string;
    roomDescription: string;
    displayImageUrl: string;
    nightlyRate: string;
    weeklyRate: string;
    imageAltText: string | null;
    moreImagesUrlList: string[];
    createdTimestamp: Date;
    updatedTimestamp: Date;
}

export interface BookingLookupPayload {
    referenceId: string,
    clientPage:  ClientPage,
    bookingDetails: BookingDetails[],
    payment: Payment,
    guest: Guest
}
