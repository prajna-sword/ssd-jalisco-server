import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import * as bookingPayloadDto from './dto/booking-payload.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  create(@Body() bookingPayload: bookingPayloadDto.BookingPayload) {
    return this.bookingsService.createBooking(bookingPayload);
  }

  @Get('lookup')
  bookingUUIDLookup(@Query('referenceId') referenceId: string) {
    return this.bookingsService.lookupBooking(referenceId);
  }

  @Get('lookup/check')
  doesBookimgExists(@Query('referenceId') referenceId: string) {
    return this.bookingsService.doesBookingExist(referenceId);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  // YYYY-MM-DD
  @Get('/:id/dates')
  async getBookings(
    @Param('id') clientPageId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.bookingsService.findOverlappingBookings(clientPageId, startDate, endDate);
  }
}
