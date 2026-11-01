import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientPage } from './entities/client-page.entity';

@Injectable()
export class ClientPagesService {
  constructor(
    @InjectRepository(ClientPage)
    private readonly clientPageRepository: Repository<ClientPage>, // 👈 Inject repository
  ) { }

  async findAll(): Promise<ClientPage[]> {
    return await this.clientPageRepository.find();
  }

  async findOne(id: string): Promise<ClientPage | null> {
    return await this.clientPageRepository.findOneBy({ clientPageId: id });
  }
}
