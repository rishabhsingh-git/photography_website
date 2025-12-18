import { Column, Entity, Index, ManyToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Photo } from './photo.entity';

@Entity({ name: 'tags' })
export class Tag extends BaseEntity {
  @Index({ unique: true })
  @Column()
  name!: string;

  @ManyToMany(() => Photo, (photo) => photo.tags)
  photos!: Photo[];
}
