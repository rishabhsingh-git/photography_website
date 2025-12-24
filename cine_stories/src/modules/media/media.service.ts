import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import type { Express } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageService } from '../storage/storage.service';
import { Photo } from '../../infrastructure/database/entities/photo.entity';
import { Category } from '../../infrastructure/database/entities/category.entity';
import { Tag } from '../../infrastructure/database/entities/tag.entity';
import { Service } from '../../infrastructure/database/entities/service.entity';

@Injectable()
export class MediaService {
  constructor(
    private readonly storage: StorageService,
    @InjectRepository(Photo) private readonly photos: Repository<Photo>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Tag) private readonly tags: Repository<Tag>,
    @InjectRepository(Service) private readonly services: Repository<Service>,
  ) {}

  async upload(
    ownerId: string,
    file: Express.Multer.File,
    body: { title: string; description?: string; category?: string; categoryId?: string; serviceId?: string; tags?: string[] },
  ) {
    console.log('📤 [MediaService] Starting upload:', {
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      serviceId: body.serviceId,
      categoryId: body.categoryId,
    });

    const key = `photos/${ownerId}/${randomUUID()}`;
    
    try {
      console.log('☁️ [MediaService] Uploading to storage with key:', key);
      const uploadResult = await this.storage.uploadObject({
        key,
        buffer: file.buffer,
        mimeType: file.mimetype,
      });
      const url = uploadResult.url;
      console.log('✅ [MediaService] Upload successful:', {
        provider: uploadResult.provider,
        key: uploadResult.key,
        url: url,
      });

    // Support both category name (legacy) and categoryId (new)
    const category = body.categoryId
      ? await this.categories.findOne({ where: { id: body.categoryId } })
      : body.category
      ? await this.categories.findOne({ where: { name: body.category } })
      : null;

    const service = body.serviceId
      ? await this.services.findOne({ where: { id: body.serviceId } })
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
      service,
      serviceId: body.serviceId || null,
      tags,
      owner: { id: ownerId } as any,
    });
    
      const saved = await this.photos.save(photo);
      
      console.log('💾 [MediaService] Photo saved to database:', {
        id: saved.id,
        title: saved.title,
        serviceId: saved.serviceId,
        serviceTitle: saved.service?.title,
        categoryId: saved.category?.id,
        categoryName: saved.category?.name,
        url: saved.url,
        objectKey: saved.objectKey,
      });
      
      return saved;
    } catch (error: any) {
      console.error('❌ [MediaService] Upload failed:', {
        error: error.message,
        stack: error.stack,
        fileName: file.originalname,
        serviceId: body.serviceId,
      });
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async list(cursor?: string, limit = 20, serviceId?: string) {
    const qb = this.photos.createQueryBuilder('photo')
      .leftJoinAndSelect('photo.tags', 'tag')
      .leftJoinAndSelect('photo.service', 'service')
      .leftJoinAndSelect('photo.category', 'category');
    if (cursor) qb.where('photo.id > :cursor', { cursor });
    if (serviceId) qb.andWhere('photo.serviceId = :serviceId', { serviceId });
    qb.orderBy('photo.createdAt', 'DESC').take(limit + 1);
    const rows = await qb.getMany();
    const nextCursor = rows.length > limit ? rows.pop()?.id : null;
    return { data: rows, nextCursor };
  }
}
