import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientPagesService } from 'src/client/client-pages/client-pages.service';
import { BookedRoom } from 'src/lodging/bookings/entities/booked-room.entity';
import { Guest } from 'src/lodging/guests/entities/guest.entity';
import { GuestsService } from 'src/lodging/guests/guests.service';
import { RoomsService } from 'src/lodging/rooms/rooms.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Payment } from 'src/payments/entities/payment.entity';
import { PaymentsService } from 'src/payments/payments.service';
import { calculateBookingTotalV2 } from 'src/util/booking-calculation.util';
import { In, Repository } from 'typeorm';
import { BookingLookupPayload } from './dto/booking-lookup-payload.dto';
import { BookingPayload } from './dto/booking-payload.dto';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>, // 👈 Inject repository
    @InjectRepository(BookedRoom)
    private readonly bookedRoomRepository: Repository<BookedRoom>, // 👈 Inject repository
    private readonly guestsService: GuestsService,
    private readonly paymentsService: PaymentsService,
    private readonly roomsService: RoomsService,
    private readonly clientPagesService: ClientPagesService,
    private readonly notificationService: NotificationsService
  ) { }

  // 1. Get all bookings
  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find();
  }

  // 2. Get one booking by its ID
  async findOne(id: string): Promise<Booking | null> {
    return await this.bookingRepository.findOne({
      where: { bookingId: id },
      relations: {
        bookedRooms: {
          room: true
        },
        guest: true
      },
    })
  }

  async findBookedRooms(bookedRoomIds: string[]): Promise<BookedRoom[] | null> {
    return await this.bookedRoomRepository.find({
      where: {
        bookedRoomId: In(bookedRoomIds)
      }
    })
  }

  async findOverlappingBookings(
    clientPageId: string,
    rangeStart: string,
    rangeEnd: string): Promise<BookedRoom[] | null> {
    return await this.bookedRoomRepository
      .createQueryBuilder('booking')
      .where('booking.clientPageId = :clientPageId', { clientPageId })
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

    const booking = new Booking();
    booking.guestId = savedGuest.guestId;
    booking.clientPageId = bookingPayload.clientPageId;
    let savedBooking = await this.bookingRepository.save(booking);

    const rooms = await this.roomsService.findByClientPageId(bookingPayload.clientPageId);
    let totalAmount = calculateBookingTotalV2(bookingPayload.rooms, rooms);

    const bookedRooms: BookedRoom[] = [];
    for (let roomSelection of bookingPayload.rooms) {
      let matchingRoom = rooms.find(room => room.roomId == roomSelection.roomId);
      if (matchingRoom) {
        const bookedRoom = new BookedRoom();
        bookedRoom.bookingId = savedBooking.bookingId;
        bookedRoom.guestId = savedGuest.guestId;
        bookedRoom.clientPageId = bookingPayload.clientPageId;
        bookedRoom.roomId = matchingRoom.roomId;
        bookedRoom.checkInDate = roomSelection.checkInDate as any;
        bookedRoom.checkOutDate = roomSelection.checkOutDate as any;
        bookedRoom.adultGuests = roomSelection.guestCount.adults;
        bookedRoom.childGuests = roomSelection.guestCount.children;
        bookedRoom.infantGuests = roomSelection.guestCount.infants;
        bookedRoom.petGuests = roomSelection.guestCount.pets;
        bookedRoom.roomQuantity = roomSelection.quantity;
        bookedRoom.bookedNightlyRate = matchingRoom.nightlyRate;
        bookedRoom.bookedWeeklyRate = matchingRoom.weeklyRate;
        bookedRoom.bookedMonthlyRate = matchingRoom.monthlyRate;
        bookedRoom.pricingMode = matchingRoom.pricingMode;
        const savedBookeRoom = await this.bookedRoomRepository.save(bookedRoom);
        savedBookeRoom.room = matchingRoom;
        bookedRooms.push(savedBookeRoom);
      } else {
        throw new InternalServerErrorException('No matching room found for roomId: ' + roomSelection.roomId);
      }
    }

    const payment = new Payment();
    payment.bookingId = savedBooking.bookingId;
    payment.guestId = savedGuest.guestId;
    payment.paymentAmount = totalAmount as unknown as string;
    payment.paymentType = 'hotel_booking';
    payment.isRefunded = false;
    payment.stripePaymentId = bookingPayload.stripePaymentIntentId;
    await this.paymentsService.save(payment);

    const referenceId = savedBooking.bookingUuid;
    // throw new Error('Stop booking so it wont redirect and you can resubmit over and over');

    // Create a notification for the client to view in their dashboard
    savedBooking.bookedRooms = bookedRooms;
    this.notificationService.createBookingNotification(savedBooking, savedGuest);
    return { referenceId };
  }

  async doesBookingExist(referenceId: string): Promise<Object> {
    let clientRouteSegment;
    let matchingBooking = await this.bookingRepository.createQueryBuilder('booking')
      .where('booking.bookingUuid = :referenceId', { referenceId })
      .getOne();
    if (matchingBooking) {
      let clientPage = await this.clientPagesService.findOne(matchingBooking?.clientPageId as string);
      clientRouteSegment = clientPage?.businessNameRouteSegment;
    }
    return { clientRouteSegment };
  }

  async lookupBooking(referenceId: string): Promise<BookingLookupPayload> {
    let clientPage;
    let payment;
    let guest;

    let matchingBooking = await this.bookingRepository.createQueryBuilder('booking')
      .where('booking.booking_uuid = :referenceId', { referenceId })
      .leftJoinAndSelect('booking.bookedRooms', 'bookedRoom')
      .leftJoinAndSelect('bookedRoom.room', 'room')
      .getOne();
    if (matchingBooking) {
      payment = await this.paymentsService.findByBookingId(matchingBooking?.bookingId as string);
      guest = await this.guestsService.findOne(matchingBooking.guestId);
      clientPage = await this.clientPagesService.findOne(matchingBooking.clientPageId as string);
    }

    return {
      booking: matchingBooking as Booking,
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

  async cancelBookedRooms(bookedRoomIds: string[]): Promise<void> {
    const bookedRooms = await this.findBookedRooms(bookedRoomIds);
    if (bookedRooms) {
      bookedRooms?.forEach(room => {
        room.isCanceled = true;
        room.cancellationTimestamp = new Date();
      });
      await this.bookedRoomRepository.save(bookedRooms as BookedRoom[]);
    }
  }
}
