import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/clients/entities/client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientsService {
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>;

    async getClientById(clientId: string): Promise<Client | null> {
        return await this.clientRepository.findOne({
            where: {
                clientId,
            },
            relations: {
                clientPages: true
            }
        })
    }
}
