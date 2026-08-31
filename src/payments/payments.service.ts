import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>, // 👈 Inject repository
  ) { }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find();
  }

  async findOne(id: string): Promise<Payment | null> {
    return await this.paymentRepository.findOneBy({ paymentId: id });
  }

  async save(payment: Payment): Promise<Payment | null> {
    return await this.paymentRepository.save(payment);
  }

}
