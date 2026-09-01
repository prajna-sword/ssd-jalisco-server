import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GuestInquiriesService } from './guest-inquiries.service';
import { CreateGuestInquiryDto } from './dto/create-guest-inquiry.dto';
import { UpdateGuestInquiryDto } from './dto/update-guest-inquiry.dto';

@Controller('guest-inquiries')
export class GuestInquiriesController {
  constructor(private readonly guestInquiriesService: GuestInquiriesService) {}

  @Post()
  create(@Body() createGuestInquiryDto: CreateGuestInquiryDto) {
    return this.guestInquiriesService.create(createGuestInquiryDto);
  }

  @Get()
  findAll() {
    return this.guestInquiriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestInquiriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuestInquiryDto: UpdateGuestInquiryDto) {
    return this.guestInquiriesService.update(+id, updateGuestInquiryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guestInquiriesService.remove(+id);
  }
}
