import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateClientPageDto } from 'src/client/client-pages/dto/update-client-page.dto';
import { Repository } from 'typeorm';
import { ClientPage } from './entities/client-page.entity';

@Injectable()
export class ClientPagesService {
  constructor(
    @InjectRepository(ClientPage)
    private readonly clientPageRepository: Repository<ClientPage>, // 👈 Inject repository
  ) { }

  async update(clientPageId: string, payload: UpdateClientPageDto): Promise<ClientPage> {
    // 1. Fetches the entity by ID and merges the new fields
    const user = await this.clientPageRepository.preload({
      clientPageId,
      ...payload,
    });

    // 2. Handles missing records cleanly
    if (!user) {
      throw new NotFoundException(`Page with ID "${clientPageId}" not found`);
    }

    // 3. Persists changes and runs TypeORM entity hooks/subscribers
    return this.clientPageRepository.save(user);
  }

  async findAll(): Promise<ClientPage[]> {
    const clientPages = await this.clientPageRepository.find();
    // for (let page of clientPages as any) {
    //   console.log(page);
    // }
    return clientPages;
  }

  async findOne(id: string): Promise<ClientPage | null> {
    const clientPages = await this.clientPageRepository.findOneBy({ clientPageId: id });
    // for (let page of clientPages as any) {
    //   console.log(page);
    // }
    return clientPages;
  }
}
