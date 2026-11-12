import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>, // 👈 Inject repository
  ) { }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findOne(id: string): Promise<Room | null> {
    return await this.roomRepository.findOneBy({ roomId: id });
  }

}
