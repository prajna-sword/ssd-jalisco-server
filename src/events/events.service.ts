import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>, // 👈 Inject repository
  ) { }

  async findAll(): Promise<Event[]> {
    return await this.eventRepository.find();
  }

  async findOne(id: string): Promise<Event | null> {
    return await this.eventRepository.findOneBy({ eventId: id });
  }
}
