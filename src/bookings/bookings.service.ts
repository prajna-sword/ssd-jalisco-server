import { Injectable } from '@nestjs/common';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestsService } from 'src/guests/guests.service';
import { PaymentsService } from 'src/payments/payments.service';
import { BookingPayload } from './dto/booking-payload.dto';
import { Guest } from 'src/guests/entities/guest.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>, // 👈 Inject repository
    private readonly guestsService: GuestsService,
    private readonly paymentsService: PaymentsService
  ) { }

  // 1. Get all bookings
  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find();
  }

  // 2. Get one booking by its ID
  async findOne(id: string): Promise<Booking | null> {
    return await this.bookingRepository.findOneBy({ bookingId: id });
  }

  async findOverlappingBookings(rangeStart: string, rangeEnd: string): Promise<Booking[] | null> {
    return await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.checkInDate <= :rangeEnd', { rangeEnd })
      .andWhere('booking.checkOutDate >= :rangeStart', { rangeStart })
      .getMany();
  }

  async createBooking(bookingPayload: BookingPayload): Promise<Booking | null> {
    console.log(bookingPayload);

    // save the guest info
    const guest = new Guest();
    guest.firstName = bookingPayload.guest.firstName;
    guest.lastName = bookingPayload.guest.lastName;
    guest.emailAddress = bookingPayload.guest.emailAddress;
    guest.phoneCountryCode = bookingPayload.guest.phoneCountryCode;
    guest.phoneLocal = bookingPayload.guest.phoneLocal;
    guest.guestDeviceId = 'fake-device-id';
    guest.guestInet = '0.0.0.0';
    let savedGuest = await this.guestsService.save(guest);

    // save the booking(s) info
    // TODO: build support for multiple bookings -> 1 guest & payment
    let savedBooking;

    for (let roomId of bookingPayload.room.roomIds) {
      if (roomId != null) {
        const booking = new Booking();
        booking.checkInDate = bookingPayload.room.checkInDate;
        booking.checkOutDate = bookingPayload.room.checkOutDate;
        booking.numberOfGuests = bookingPayload.guest.numberOfGuests;
        booking.roomId = roomId as any;
        booking.checkInTime = bookingPayload.guest.checkInTime;
        booking.checkOutTime = bookingPayload.guest.checkInTime;
        booking.guestId = savedGuest.guestId;
        console.log(booking);
        savedBooking = await this.bookingRepository.save(booking);
      }
    }

    // save the payment info
    const payment = new Payment();
    payment.bookingId = savedBooking.bookingId;
    payment.roomId = savedBooking.roomId;
    payment.guestId = savedGuest.guestId;
    payment.paymentAmount = bookingPayload.currentTotal as any;
    payment.isRefunded = false;
    payment.stripePaymentId = 'fake-stripe-payment-id';
    let savedPayment = await this.paymentsService.save(payment);

    // return the booking(s)
    return savedBooking;
  }

}
