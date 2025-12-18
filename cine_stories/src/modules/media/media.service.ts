import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import type { Express } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageService } from '../storage/storage.service';
import { Photo } from '../../infrastructure/database/entities/photo.entity';
import { Category } from '../../infrastructure/database/entities/category.entity';
import { Tag } from '../../infrastructure/database/entities/tag.entity';

@Injectable()
export class MediaService {
  constructor(
    private readonly storage: StorageService,
    @InjectRepository(Photo) private readonly photos: Repository<Photo>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Tag) private readonly tags: Repository<Tag>,
  ) {}

  async upload(
    ownerId: string,
    file: Express.Multer.File,
    body: { title: string; description?: string; category?: string; tags?: string[] },
  ) {
    const key = `photos/${ownerId}/${randomUUID()}`;
    const url = await this.storage.uploadObject({
      key,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });

    const category = body.category
      ? await this.categories.findOne({ where: { name: body.category } })
      : null;

    const tags = body.tags?.length
      ? await Promise.all(
          body.tags.map(async (name) => {
            let tag = await this.tags.findOne({ where: { name } });
            if (!tag) tag = await this.tags.save(this.tags.create({ name }));
            return tag;
          }),
        )
      : [];

    const photo = this.photos.create({
      title: body.title,
      description: body.description,
      objectKey: key,
      url,
      category,
      tags,
      owner: { id: ownerId } as any,
    });
    return this.photos.save(photo);
  }

  async list(cursor?: string, limit = 20) {
    const qb = this.photos.createQueryBuilder('photo').leftJoinAndSelect('photo.tags', 'tag');
    if (cursor) qb.where('photo.id > :cursor', { cursor });
    qb.orderBy('photo.createdAt', 'DESC').take(limit + 1);
    const rows = await qb.getMany();
    const nextCursor = rows.length > limit ? rows.pop()?.id : null;
    return { data: rows, nextCursor };
  }
}
