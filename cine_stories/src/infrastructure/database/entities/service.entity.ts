import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity({ name: 'services' })
@Index('idx_service_title', ['title'])
export class Service extends BaseEntity {
  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  slogan?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column('text', { array: true, default: () => "ARRAY[]::text[]" })
  highlights!: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountedPrice?: number | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  icon?: string | null;
}

