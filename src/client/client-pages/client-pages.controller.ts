import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import * as updateClientPageDto from 'src/client/client-pages/dto/update-client-page.dto';
import { ClientPagesService } from './client-pages.service';

@Controller('clients/pages')
export class ClientPagesController {
  constructor(private readonly clientPagesService: ClientPagesService) { }

  @Get()
  findAll() {
    return this.clientPagesService.findAll();
  }

  @Patch(':id')
  updateClientPage(@Param('id') id: string,
    @Body() payload: updateClientPageDto.UpdateClientPageDto) {
    console.log(payload);
    return this.clientPagesService.update(id, payload);
  }
}
