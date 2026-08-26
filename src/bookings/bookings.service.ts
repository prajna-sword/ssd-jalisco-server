import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  create(createBookingDto: CreateBookingDto) {
    return 'This action adds a new booking';
  }

  findAll() {
    const exampleBooking = {
      bookingId: '1',
      guestId: '1',
      roomId: '1',
      startDate: '2026/08/07',
      endDate: '2026/08/10',
      checkInTime: '8:00 AM'
    } as CreateBookingDto;
    return [
      exampleBooking
    ];
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
