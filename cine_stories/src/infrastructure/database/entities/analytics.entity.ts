import { Column, Entity, ManyToOne, Index } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  SERVICE_VIEW = 'service_view',
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT_START = 'checkout_start',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  CART_ABANDONED = 'cart_abandoned',
}

@Entity({ name: 'analytics_events' })
@Index(['createdAt'])
export class AnalyticsEvent extends BaseEntity {
  @Column({ type: 'enum', enum: AnalyticsEventType })
  @Index()
  eventType!: AnalyticsEventType;

  @Column({ type: 'text', nullable: true })
  page?: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @ManyToOne(() => User, { nullable: true, eager: false })
  user?: User | null;

  @Column({ type: 'text', nullable: true })
  sessionId?: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent?: string | null;

  @Column({ type: 'text', nullable: true })
  ipAddress?: string | null;
}

