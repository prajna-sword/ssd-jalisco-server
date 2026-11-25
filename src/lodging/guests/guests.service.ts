import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingPayload } from 'src/lodging/bookings/dto/booking-payload.dto';
import { Equal, Repository } from 'typeorm';
import { Guest } from './entities/guest.entity';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>, // 👈 Inject repository
  ) { }

  async findAll(): Promise<Guest[]> {
    return await this.guestRepository.find();
  }

  async findClientGuests(clientPageId: string): Promise<Guest[]> {
    return await this.guestRepository.find({
      where: {
        clientPageId,
      },
      relations: {
        bookings: {
          bookedRooms: {
            room: true
          }
        }
      }
    })
  }

  async findOne(id: string): Promise<Guest | null> {
    return await this.guestRepository.findOneBy({ guestId: id });
  }

  async getGuestDetail(guestId: string): Promise<Guest> {
    const guests = await this.guestRepository.find({
      where: {
        guestId: Equal(guestId)
      },
      relations: {
        bookings: {
          bookedRooms: {
            room: true
          }
        }
      }
    });
    return guests[0];
  }

  async save(guest: Guest) {
    return this.guestRepository.save(guest);
  }

 // TODO -- ADD UNIQUE CONSTRAINT TO GUEST PHONE, EMAIL, STRIPE ID
  async findBookingGuest(booking: BookingPayload): Promise<Guest | null> {
    let matchingGuests = await this.guestRepository.find({
      where: {
        phoneNumber: booking.guest.phoneNumber
      }
    });
    if (!matchingGuests[0]) {
      matchingGuests = await this.guestRepository.find({
        where: {
          emailAddress: booking.guest.emailAddress
        }
      });
      if (!matchingGuests[0]) {
        return null;
      }
    }
    /** Update the guest with changed data */
    const updatedGuest = this.guestRepository.create({
     fullName: booking.guest.guestName,
     emailAddress: booking.guest.emailAddress,
     phoneNumber: booking.guest.phoneNumber,
     addrLineOne: booking.guest.guestBillingAddress.line1,
     addrLineTwo: booking.guest.guestBillingAddress.line2,
     addrCity: booking.guest.guestBillingAddress.city,
     addrCountry: booking.guest.guestBillingAddress.country,
     addrZipCode: booking.guest.guestBillingAddress.postalCode,
     addrStateOrProvince: booking.guest.guestBillingAddress.state,
     guestDeviceId: 'fake-device-id',
     guestInet: '0.0.0.0',
     guestId: matchingGuests[0].guestId,
     stripeCustId: matchingGuests[0].guestId
    });

    return await this.guestRepository.save(updatedGuest);
  }

  async createBookingGuest(booking: BookingPayload, stripeId: string): Promise<Guest> {
    const guest = new Guest();
    guest.fullName = booking.guest.guestName;
    guest.emailAddress = booking.guest.emailAddress;
    guest.phoneNumber = booking.guest.phoneNumber;
    guest.addrLineOne = booking.guest.guestBillingAddress.line1;
    guest.addrLineTwo = booking.guest.guestBillingAddress.line2;
    guest.addrCity = booking.guest.guestBillingAddress.city;
    guest.addrCountry = booking.guest.guestBillingAddress.country;
    guest.addrZipCode = booking.guest.guestBillingAddress.postalCode
    guest.addrStateOrProvince = booking.guest.guestBillingAddress.state;
    guest.stripeCustId = stripeId;
    guest.guestDeviceId = 'fake-device-id';
    guest.guestInet = '0.0.0.0';
    let savedGuest = await this.guestRepository.save(guest);
    return savedGuest;
  }

}
