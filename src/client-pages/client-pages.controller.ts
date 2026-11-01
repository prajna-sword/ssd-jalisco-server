import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientPagesService } from './client-pages.service';

@Controller('clients/pages')
export class ClientPagesController {
  constructor(private readonly clientPagesService: ClientPagesService) {}

  @Get()
  findAll() {
    return this.clientPagesService.findAll();
  }
}
