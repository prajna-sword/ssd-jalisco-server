import { Controller, Get, Param } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('/:id')
  getClientById(@Param('id') clientId: string) {
    return this.clientsService.getClientById(clientId);
  }
}
