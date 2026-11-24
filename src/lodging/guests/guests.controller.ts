import { Controller, Get, Param } from '@nestjs/common';
import { GuestsService } from './guests.service';

@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) { }
  @Get()
  findAll() {
    return this.guestsService.findAll();
  }

  @Get('/:id')
  findClientGuests(@Param('id') clientPageId:  string) {
    return this.guestsService.findClientGuests(clientPageId);
  }

  @Get('/:id/detail')
  getGuestDetail(@Param('id') guestId: string) {
    return this.guestsService.getGuestDetail(guestId);
  }
}
