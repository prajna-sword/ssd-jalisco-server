import { Module } from '@nestjs/common';
import { GuestInquiriesService } from './guest-inquiries.service';
import { GuestInquiriesController } from './guest-inquiries.controller';

@Module({
  controllers: [GuestInquiriesController],
  providers: [GuestInquiriesService],
})
export class GuestInquiriesModule {}
