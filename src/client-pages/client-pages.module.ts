import { Module } from '@nestjs/common';
import { ClientPagesService } from './client-pages.service';
import { ClientPagesController } from './client-pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientPage } from './entities/client-page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientPage])],
  controllers: [ClientPagesController],
  providers: [ClientPagesService],
})
export class ClientPagesModule { }
