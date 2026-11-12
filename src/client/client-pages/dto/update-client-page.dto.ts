import { PartialType } from '@nestjs/mapped-types';
import { CreateClientPageDto } from './create-client-page.dto';

export class UpdateClientPageDto extends PartialType(CreateClientPageDto) {}
