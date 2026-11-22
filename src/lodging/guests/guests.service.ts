import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './entities/guest.entity';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>, // 👈 Inject repository
  ) { }

  async findAll(): Promise<Guest[]> {
    return await this.guestRepository.find();
  }

  async findClientGuests(clientPageId: string): Promise<Guest[]> {
    return await this.guestRepository.find({
      where: {
        clientPageId,
      },
      relations: {
        bookings: {
          bookedRooms: {
            room: true
          }
        }
      }
    })
  }

  async findOne(id: string): Promise<Guest | null> {
    return await this.guestRepository.findOneBy({ guestId: id });
  }

  async save(guest: Guest) {
    return this.guestRepository.save(guest);
  }

}
