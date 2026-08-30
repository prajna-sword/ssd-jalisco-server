import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>, // 👈 Inject repository
  ) {}

  // 1. Get all bookings
  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find();
  }

  // 2. Get one booking by its ID
  async findOne(id: string): Promise<Booking | null> {
    return await this.bookingRepository.findOneBy({ bookingId: id });
  }

}
