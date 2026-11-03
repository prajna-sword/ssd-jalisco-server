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
    const clientPages = await this.clientPageRepository.find();
    for (let page of clientPages as any) {
      console.log(page);
    }
    return clientPages;
  }

  async findOne(id: string): Promise<ClientPage | null> {
    const clientPages = await this.clientPageRepository.findOneBy({ clientPageId: id });
    for (let page of clientPages as any) {
      console.log(page);
    }
    return clientPages;
  }
}
