import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Photo } from '../../infrastructure/database/entities/photo.entity';

@Injectable()
export class SearchService {
  constructor(@InjectRepository(Photo) private readonly photos: Repository<Photo>) {}

  async search(params: { text?: string; tags?: string[]; categoryIds?: string[]; limit?: number }) {
    const qb = this.photos.createQueryBuilder('photo').leftJoinAndSelect('photo.tags', 'tag');
    if (params.text) {
      qb.andWhere('photo.title ILIKE :text OR photo.description ILIKE :text', {
        text: `%${params.text}%`,
      });
    }
    if (params.tags?.length) qb.andWhere('tag.name IN (:...tags)', { tags: params.tags });
    if (params.categoryIds?.length)
      qb.andWhere('photo.categoryId IN (:...categoryIds)', { categoryIds: params.categoryIds });

    qb.take(params.limit || 20);
    return qb.getMany();
  }
}
