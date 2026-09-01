import { Module } from '@nestjs/common';
import { SatInvoicesService } from './sat-invoices.service';
import { SatInvoicesController } from './sat-invoices.controller';

@Module({
  controllers: [SatInvoicesController],
  providers: [SatInvoicesService],
})
export class SatInvoicesModule {}
