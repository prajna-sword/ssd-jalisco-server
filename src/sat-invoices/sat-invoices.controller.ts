import { Controller } from '@nestjs/common';
import { SatInvoicesService } from './sat-invoices.service';

@Controller('sat-invoices')
export class SatInvoicesController {
  constructor(private readonly satInvoicesService: SatInvoicesService) {}
}
