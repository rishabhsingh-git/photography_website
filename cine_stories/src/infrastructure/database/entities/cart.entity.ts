import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Service } from './service.entity';

@Entity({ name: 'cart_items' })
export class CartItem extends BaseEntity {
  @ManyToOne(() => User, { eager: false })
  user!: User;

  @ManyToOne(() => Service, { eager: true })
  service!: Service;

  @Column({ type: 'int', default: 1 })
  quantity!: number;
}

