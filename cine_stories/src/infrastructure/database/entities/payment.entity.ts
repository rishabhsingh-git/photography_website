import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum PaymentProvider {
  RAZORPAY = 'razorpay',
}

@Entity({ name: 'payments' })
export class Payment extends BaseEntity {
  @Column({ type: 'enum', enum: PaymentProvider })
  provider!: PaymentProvider;

  @Column()
  referenceId!: string;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @ManyToOne(() => User, (user) => user.payments, { eager: false })
  user!: User;
}
