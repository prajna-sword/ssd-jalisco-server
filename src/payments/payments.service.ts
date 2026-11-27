import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentStatuses, PaymentTypes } from 'src/payments/dto/payment-constants';
import { EntityManager, Repository } from 'typeorm';
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

  async createPending(
    bookingId: string,
    guestId: string,
    paymentIntentId: string,
    totalAmount: string,
    netClientAmount: string,
    manager?: EntityManager
  ): Promise<Payment> {
    const repo = manager ? manager.getRepository(Payment) : this.paymentRepository;
    const payment = new Payment();
    payment.bookingId = bookingId;
    payment.guestId = guestId;
    payment.intentAmount = totalAmount;
    payment.netClientAmount = netClientAmount;
    payment.paymentType = PaymentTypes.ROOM_HOLD;
    payment.paymentStatus = PaymentStatuses.PENDING;
    payment.isRefunded = false;
    payment.paymentIntentId = paymentIntentId;
    return await repo.save(payment);
  }
}
