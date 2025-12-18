import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Photo } from './photo.entity';

@Entity({ name: 'categories' })
export class Category extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Photo, (photo) => photo.category)
  photos!: Photo[];
}
