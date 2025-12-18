import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}

@Entity({ name: 'notifications' })
export class Notification extends BaseEntity {
  @Column()
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel!: NotificationChannel;

  @Column({ default: false })
  delivered!: boolean;

  @ManyToOne(() => User, (user) => user.notifications, { eager: false })
  user!: User;
}
