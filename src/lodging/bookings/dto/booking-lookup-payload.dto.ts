import { ClientPage } from "src/client/client-pages/entities/client-page.entity";
import { Booking } from "src/lodging/bookings/entities/booking.entity";
import { Guest } from "src/lodging/guests/entities/guest.entity";
import { Payment } from "src/payments/entities/payment.entity";


export interface BookingLookupPayload {
    referenceId: string;
    clientPage:  ClientPage;
    booking: Booking;
    payment: Payment;
    guest: Guest;
}
