import { PartialType } from '@nestjs/mapped-types';
import { CreateGuestInquiryDto } from './create-guest-inquiry.dto';

export class UpdateGuestInquiryDto extends PartialType(CreateGuestInquiryDto) {}
