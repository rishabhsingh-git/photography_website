import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

@Entity({ name: 'photos' })
@Index('idx_photo_title', ['title'])
@Index('idx_photo_tags', { synchronize: false }) // GIN index via migration
export class Photo extends BaseEntity {
  @Column()
  title!: string;

  // Explicit text type to avoid TypeORM inferring Object (unsupported in Postgres)
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column()
  objectKey!: string;

  @Column()
  url!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  colors!: string[];

  @ManyToOne(() => User, (user) => user.photos, { eager: false })
  owner!: User;

  @ManyToOne(() => Category, (category) => category.photos, { eager: false, nullable: true })
  category?: Category | null;

  @ManyToMany(() => Tag, (tag) => tag.photos, { cascade: true })
  @JoinTable()
  tags!: Tag[];
}
