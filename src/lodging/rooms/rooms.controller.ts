import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateRoomDto } from 'src/lodging/rooms/dto/create-room.dto';
import { UpdateRoomDto } from 'src/lodging/rooms/dto/update-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Post()
  async createRoom(
    @Body() body: CreateRoomDto
  ) {
    return await this.roomsService.create(body);
  }
  
  @Patch(':id')
  updateClientPage(@Param('id') id: string,
    @Body() payload: UpdateRoomDto) {
    return this.roomsService.update(id, payload);
  }
}
