import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoomDto } from 'src/lodging/rooms/dto/create-room.dto';
import { UpdateRoomDto } from 'src/lodging/rooms/dto/update-room.dto';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>, // 👈 Inject repository
  ) { }

  async update(roomId: string, payload: UpdateRoomDto): Promise<Room> {
    console.log(payload.displayImageUrls?.length)
    // 1. Fetches the entity by ID and merges the new fields
    const room = await this.roomRepository.preload({
      ...payload,
      roomId,
    });

    // 2. Handles missing records cleanly
    if (!room) {
      throw new NotFoundException(`Room with ID "${roomId}" not found`);
    }
    console.log(room.displayImageUrls.length)

    // 3. Persists changes and runs TypeORM entity hooks/subscribers
    return this.roomRepository.save(room);
  }

  async create(payload: CreateRoomDto): Promise<Room> {
    return this.roomRepository.save(payload);
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findOne(id: string): Promise<Room | null> {
    return await this.roomRepository.findOneBy({ roomId: id });
  }

  async findByClientPageId(clientPageId: string): Promise<Room[]> {
    return await this.roomRepository.createQueryBuilder('room')
      .where('room.clientPageId = :clientPageId', { clientPageId })
      .getMany();
  }
}
