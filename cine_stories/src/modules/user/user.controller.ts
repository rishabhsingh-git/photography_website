import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { AdminGuard } from '../auth/guards/admin.guard';
import { User } from '../../infrastructure/database/entities/user.entity';
import { Payment } from '../../infrastructure/database/entities/payment.entity';

@Controller('users')
@UseGuards(AdminGuard)
export class UserController {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
  ) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    const query = this.users.createQueryBuilder('user')
      .leftJoinAndSelect('user.payments', 'payments')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      query.where([
        { email: ILike(`%${search}%`) },
        { name: ILike(`%${search}%`) },
        { phone: ILike(`%${search}%`) },
      ]);
    }

    const users = await query.getMany();
    
    return users.map(user => {
      const paidPayments = user.payments?.filter(p => p.status === 'paid') || [];
      const totalPaid = paidPayments.reduce((sum, p) => {
        const amount = (p.payload as any)?.amount || 0;
        return sum + (amount / 100); // Convert from paise
      }, 0);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        roles: user.roles,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        paymentCount: user.payments?.length || 0,
        paidPaymentCount: paidPayments.length,
        totalPaidAmount: totalPaid,
        payments: paidPayments.map(p => ({
          id: p.id,
          orderId: p.referenceId,
          amount: ((p.payload as any)?.amount || 0) / 100,
          status: p.status,
          createdAt: p.createdAt,
          paymentId: (p.payload as any)?.razorpay_payment_id || null,
        })),
      };
    });
  }
}

