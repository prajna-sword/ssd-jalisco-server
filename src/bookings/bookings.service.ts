import { Injectable } from '@nestjs/common';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestsService } from 'src/guests/guests.service';
import { PaymentsService } from 'src/payments/payments.service';
import { BookingPayload } from './dto/booking-payload.dto';
import { Guest } from 'src/guests/entities/guest.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { MultiBookingXREF } from './entities/multi-booking-xref.entity';
import { BookedRoom, BookingDetails, BookingLookupPayload } from './dto/booking-lookup-payload.dto';
import { RoomsService } from 'src/rooms/rooms.service';
import { ClientPagesService } from 'src/client-pages/client-pages.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>, // 👈 Inject repository
    @InjectRepository(MultiBookingXREF)
    private readonly xrefRepository: Repository<MultiBookingXREF>, // 👈 Inject repository
    private readonly guestsService: GuestsService,
    private readonly paymentsService: PaymentsService,
    private readonly roomsService: RoomsService,
    private readonly clientPagesService: ClientPagesService
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

  async createBooking(bookingPayload: BookingPayload): Promise<Object> {
    console.log(bookingPayload);

    // save the guest info
    const guest = new Guest();
    guest.fullName = bookingPayload.guest.guestName;
    guest.emailAddress = bookingPayload.guest.emailAddress;
    guest.phoneNumber = bookingPayload.guest.phoneNumber;
    guest.addrLineOne = bookingPayload.guest.guestBillingAddress.line1;
    guest.addrLineTwo = bookingPayload.guest.guestBillingAddress.line2;
    guest.addrCity = bookingPayload.guest.guestBillingAddress.city;
    guest.addrCountry = bookingPayload.guest.guestBillingAddress.country;
    guest.addrZipCode = bookingPayload.guest.guestBillingAddress.postalCode
    guest.addrStateOrProvince = bookingPayload.guest.guestBillingAddress.state;
    guest.stripeCustId = 'fake-customer-id';
    guest.guestDeviceId = 'fake-device-id';
    guest.guestInet = '0.0.0.0';
    let savedGuest = await this.guestsService.save(guest);

    // save the booking(s) info
    let savedBookings: Booking[] = [];

    let roomIdCount = 0;
    for (let roomId of bookingPayload.room.roomIds) {
      if (roomId != null) {
        roomIdCount++;
      }
    }

    // Create Multibooking if more than 1 room
    let savedXref: MultiBookingXREF | null = null;
    if (roomIdCount > 1) {
      const multiBookingXref = new MultiBookingXREF();
      multiBookingXref.clientPageId = '13'; //TODO
      multiBookingXref.guestId = savedGuest.guestId;
      savedXref = await this.xrefRepository.save(multiBookingXref);
    }

    // multiple booked rooms at the same time will have 1 stripe payment,
    // correlated with multiple bookings and payments
    // our system will treat it like the rooms were booked separately by the same guest
    for (let roomId of bookingPayload.room.roomIds) {
      if (roomId != null) {
        const booking = new Booking();
        if (savedXref) {
          booking.multiBookingXrefId = savedXref.multiBookingXrefId;
        }
        booking.checkInDate = bookingPayload.room.checkInDate;
        booking.checkOutDate = bookingPayload.room.checkOutDate;
        booking.numberOfGuests = bookingPayload.guest.numberOfGuests;
        booking.roomId = roomId as any;
        booking.checkInTime = '14:30:15';
        booking.checkOutTime = '14:30:15';
        booking.guestId = savedGuest.guestId;
        let savedBooking = await this.bookingRepository.save(booking);
        savedBookings.push(savedBooking);
      }
    }

    // save the payment info
    const payment = new Payment();
    if (savedXref) {
      payment.multiBookingXrefId = savedXref.multiBookingXrefId;
    } else {
      payment.bookingId = savedBookings[0].bookingId;
    }
    payment.guestId = savedGuest.guestId;
    payment.paymentAmount = bookingPayload.currentTotal as any; // TODO make sure its the server calculated total
    payment.paymentType = 'hotel_booking';
    payment.isRefunded = false;
    payment.stripePaymentId = bookingPayload.stripePaymentIntentId;
    let savedPayment = await this.paymentsService.save(payment);

    const referenceId = savedXref ? savedXref.multiBookingUUID : savedBookings[0].bookingUUID;
    console.log(referenceId);

    // throw new Error('Stop booking so it wont redirect and you can resubmit over and over');
    // return the referenceID to route to confirmation screen
    return { referenceId };
  }

  async lookupBooking(referenceId: string): Promise<BookingLookupPayload> {
    let matchingXref = await this.xrefRepository.createQueryBuilder('xref')
      .where('xref.multiBookingUUID = :referenceId', { referenceId })
      .getOne();

    let bookingDetails: BookingDetails[] = [];
    let clientPage;
    let payment;
    let guest;

    if (matchingXref) {
      let xrefId = matchingXref.multiBookingXrefId;
      let bookings = await this.bookingRepository.createQueryBuilder('booking')
        .where('booking.multiBookingXrefId = :xrefId', { xrefId })
        .getMany();
      payment = await this.paymentsService.findByXrefId(xrefId);
      guest = await this.guestsService.findOne(matchingXref.guestId);
      if (bookings && bookings.length > 0) {
        for (let booking of bookings) {
          let room = await this.roomsService.findOne(booking.roomId);
          clientPage = await this.clientPagesService.findOne(room?.clientPageId as string);
          const bookingDetail: BookingDetails = booking as unknown as BookingDetails;
          const bookedRoom: BookedRoom = room as BookedRoom;
          bookingDetail.bookedRoom = bookedRoom;
          bookingDetails.push(bookingDetail);
        }
      }
    } else {
      let matchingBooking = await this.bookingRepository.createQueryBuilder('booking')
        .where('booking.bookingUUID = :referenceId', { referenceId })
        .getOne();
      if (matchingBooking) {
        payment = await this.paymentsService.findByBookingId(matchingBooking?.bookingId as string);
        guest = await this.guestsService.findOne(matchingBooking.guestId);
        let room = await this.roomsService.findOne(matchingBooking.roomId);
        clientPage = await this.clientPagesService.findOne(room?.clientPageId as string);
        const bookingDetail: BookingDetails = matchingBooking as unknown as BookingDetails;
        const bookedRoom: BookedRoom = room as BookedRoom;
        bookingDetail.bookedRoom = bookedRoom;
        bookingDetails.push(bookingDetail);
      }
    }

    return {
      bookingDetails,
      payment,
      guest,
      referenceId,
      clientPage
    }
  }
}
