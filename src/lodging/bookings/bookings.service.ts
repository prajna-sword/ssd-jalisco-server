import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientPagesService } from 'src/client/client-pages/client-pages.service';
import { Guest } from 'src/lodging/guests/entities/guest.entity';
import { GuestsService } from 'src/lodging/guests/guests.service';
import { RoomsService } from 'src/lodging/rooms/rooms.service';
import { Payment } from 'src/payments/entities/payment.entity';
import { PaymentsService } from 'src/payments/payments.service';
import { Repository } from 'typeorm';
import { BookedRoom, BookingDetails, BookingLookupPayload } from './dto/booking-lookup-payload.dto';
import { BookingPayload } from './dto/booking-payload.dto';
import { Booking } from './entities/booking.entity';
import { MultiBookingXREF } from './entities/multi-booking-xref.entity';

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

  async findOverlappingBookings(
    clientPageId: string,
    rangeStart: string, 
    rangeEnd: string): Promise<Booking[] | null> {
    return await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.clientPageId == :clientPageId', { clientPageId })
      .where('booking.checkInDate <= :rangeEnd', { rangeEnd })
      .andWhere('booking.checkOutDate >= :rangeStart', { rangeStart })
      .getMany();
  }

  // TODO -- save weekly rate when weekly booking
  async createBooking(bookingPayload: BookingPayload): Promise<Object> {

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

    let savedBookings: Booking[] = [];

    let roomIdCount = 0;
    for (let roomId of bookingPayload.room.roomIds) {
      if (roomId != null) {
        roomIdCount++;
      }
    }

    let savedXref: MultiBookingXREF | null = null;
    if (roomIdCount > 1) {
      const multiBookingXref = new MultiBookingXREF();
      multiBookingXref.clientPageId = bookingPayload.clientPageId;
      multiBookingXref.guestId = savedGuest.guestId;
      savedXref = await this.xrefRepository.save(multiBookingXref);
    }

    for (let roomId of bookingPayload.room.roomIds) {
      if (roomId != null) {
        const bookedRoom = await this.roomsService.findOne(roomId as unknown as string);
        const booking = new Booking();
        if (savedXref) {
          booking.multiBookingXrefId = savedXref.multiBookingXrefId;
        }
        booking.clientPageId = bookingPayload.clientPageId;
        booking.checkInDate = bookingPayload.room.checkInDate;
        booking.checkOutDate = bookingPayload.room.checkOutDate;
        booking.numberOfGuests = bookingPayload.guest.numberOfGuests;
        booking.bookedRate = bookedRoom?.nightlyRate as any;
        booking.roomId = roomId as any;
        booking.checkInTime = '14:30:15';
        booking.checkOutTime = '14:30:15';
        booking.guestId = savedGuest.guestId;
        let savedBooking = await this.bookingRepository.save(booking);
        savedBookings.push(savedBooking);
      }
    }

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
    await this.paymentsService.save(payment);

    const referenceId = savedXref ? savedXref.multiBookingUUID : savedBookings[0].bookingUUID;
    // throw new Error('Stop booking so it wont redirect and you can resubmit over and over');
    return { referenceId };
  }

  async doesBookingExist(referenceId: string): Promise<Object> {
    let clientRouteSegment;
    let matchingXref = await this.xrefRepository.createQueryBuilder('xref')
      .where('xref.multiBookingUUID = :referenceId', { referenceId })
      .getOne();
    if (matchingXref) {
      let clientPage = await this.clientPagesService.findOne(matchingXref.clientPageId);
      clientRouteSegment = clientPage?.businessNameRouteSegment;
    } else {
      let matchingBooking = await this.bookingRepository.createQueryBuilder('booking')
        .where('booking.bookingUUID = :referenceId', { referenceId })
        .getOne();
      if (matchingBooking) {
        let clientPage = await this.clientPagesService.findOne(matchingBooking?.clientPageId as string);
        clientRouteSegment = clientPage?.businessNameRouteSegment;
      }
    }
    return { clientRouteSegment };
  }

  // TODO -- refactor to reduce complexity and latency
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
          const bookedRoom: BookedRoom = room as unknown as BookedRoom;
          bookingDetail.bookedRoom = bookedRoom;
          bookingDetails.push(bookingDetail);
        }
      }
    } else {
      let matchingBooking = await this.bookingRepository.createQueryBuilder('booking')
        .where('booking.bookingUUID = :referenceId', { referenceId })
        .getOne();
      if (matchingBooking) {
        if (matchingBooking.multiBookingXrefId) {
          let matchingXref = await this.xrefRepository.findOneBy({ multiBookingXrefId: matchingBooking.multiBookingXrefId });
          payment = await this.paymentsService.findByXrefId(matchingXref?.multiBookingXrefId as string);
        } else {
          payment = await this.paymentsService.findByBookingId(matchingBooking?.bookingId as string);
        }
        guest = await this.guestsService.findOne(matchingBooking.guestId);
        let room = await this.roomsService.findOne(matchingBooking.roomId);
        clientPage = await this.clientPagesService.findOne(room?.clientPageId as string);
        const bookingDetail: BookingDetails = matchingBooking as unknown as BookingDetails;
        const bookedRoom: BookedRoom = room as unknown as BookedRoom;
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

  async cancelBooking(booking: Booking): Promise<void> {
    booking.isCanceled = true;
    booking.cancellationTimestamp = new Date();
    this.bookingRepository.save(booking);
  }
}
