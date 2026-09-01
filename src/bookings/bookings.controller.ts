import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import * as bookingPayloadDto from './dto/booking-payload.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  create(@Body() bookingPayload: bookingPayloadDto.BookingPayload) {
    return this.bookingsService.createBooking(bookingPayload);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  // YYYY-MM-DD
  @Get('dates')
  async getBookings(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.bookingsService.findOverlappingBookings(startDate, endDate);
  }
}
