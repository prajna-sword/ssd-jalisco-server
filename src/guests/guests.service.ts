import { Injectable } from '@nestjs/common';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Guest } from './entities/guest.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>, // 👈 Inject repository
  ) { }

  async findAll(): Promise<Guest[]> {
    return await this.guestRepository.find();
  }

  async findOne(id: string): Promise<Guest | null> {
    return await this.guestRepository.findOneBy({ guestId: id });
  }

}
