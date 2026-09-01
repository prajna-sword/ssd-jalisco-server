import { Injectable } from '@nestjs/common';
import { CreateGuestInquiryDto } from './dto/create-guest-inquiry.dto';
import { UpdateGuestInquiryDto } from './dto/update-guest-inquiry.dto';

@Injectable()
export class GuestInquiriesService {
  create(createGuestInquiryDto: CreateGuestInquiryDto) {
    return 'This action adds a new guestInquiry';
  }

  findAll() {
    return `This action returns all guestInquiries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} guestInquiry`;
  }

  update(id: number, updateGuestInquiryDto: UpdateGuestInquiryDto) {
    return `This action updates a #${id} guestInquiry`;
  }

  remove(id: number) {
    return `This action removes a #${id} guestInquiry`;
  }
}
