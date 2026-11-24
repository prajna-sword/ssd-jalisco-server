import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';


@Injectable()
export class PaymentsService {
  @InjectRepository(Payment)
  private readonly paymentRepository: Repository<Payment>;

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find();
  }

  async findOne(id: string): Promise<Payment | null> {
    return await this.paymentRepository.findOneBy({ paymentId: id });
  }

  async save(payment: Payment): Promise<Payment | null> {
    return await this.paymentRepository.save(payment);
  }

  async findByXrefId(xrefId: string): Promise<Payment | null> {
    return await this.paymentRepository.createQueryBuilder('payment')
      .where('payment.multiBookingXrefId = :xrefId', { xrefId })
      .getOne();
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    return await this.paymentRepository.createQueryBuilder('payment')
      .where('payment.bookingId = :bookingId', { bookingId })
      .getOne();
  }

  async refundPayment(paymentIntentId: string, refundAmount: number): Promise<void> {
    const savedPayment = await this.paymentRepository.createQueryBuilder('payment')
      .where('payment.stripePaymentId = :paymentIntentId', { paymentIntentId })
      .getOne();
    if (savedPayment) {
      savedPayment.isRefunded = true;
      savedPayment.refundTimestamp = new Date();
      savedPayment.refundedAmount = refundAmount as unknown as string;
      this.paymentRepository.save(savedPayment);
    }
  }

}
