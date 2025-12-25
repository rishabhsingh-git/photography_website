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

  async list(cursor?: string, limit = 20, serviceId?: string, categoryId?: string) {
    const qb = this.photos.createQueryBuilder('photo')
      .leftJoinAndSelect('photo.tags', 'tag')
      .leftJoinAndSelect('photo.service', 'service')
      .leftJoinAndSelect('photo.category', 'category')
      .leftJoinAndSelect('photo.owner', 'owner')
      .where('photo.deletedAt IS NULL'); // Filter out soft-deleted photos
    
    if (cursor) {
      qb.andWhere('photo.id > :cursor', { cursor });
    }
    
    if (serviceId) {
      qb.andWhere('photo.serviceId = :serviceId', { serviceId });
    }
    
    if (categoryId) {
      qb.andWhere('photo.categoryId = :categoryId', { categoryId });
    }
    
    qb.orderBy('photo.createdAt', 'DESC').take(limit + 1);
    
    const rows = await qb.getMany();
    const nextCursor = rows.length > limit ? rows.pop()?.id : null;
    
    console.log('📋 [MediaService] List query results:', {
      total: rows.length,
      serviceId,
      categoryId,
      hasNextCursor: !!nextCursor,
      sampleIds: rows.slice(0, 3).map(r => r.id),
      sampleServices: rows.slice(0, 3).map(r => ({
        id: r.id,
        serviceId: r.serviceId,
        hasService: !!r.service,
        serviceTitle: r.service?.title,
      })),
    });
    
    return { data: rows, nextCursor };
  }

  async delete(photoId: string): Promise<void> {
    console.log('🗑️ [MediaService] Deleting photo:', { photoId });
    
    try {
      // Find the photo first
      const photo = await this.photos.findOne({
        where: { id: photoId },
      });

      if (!photo) {
        throw new Error(`Photo with id ${photoId} not found`);
      }

      // Delete from storage
      if (photo.objectKey) {
        console.log('🗑️ [MediaService] Deleting from storage:', photo.objectKey);
        try {
          await this.storage.deleteObject(photo.objectKey);
          console.log('✅ [MediaService] Deleted from storage successfully');
        } catch (storageError: any) {
          console.error('⚠️ [MediaService] Storage delete failed (continuing with DB delete):', storageError.message);
          // Continue with DB delete even if storage delete fails
        }
      }

      // Soft delete from database
      await this.photos.softDelete(photoId);
      console.log('✅ [MediaService] Photo soft-deleted from database');
    } catch (error: any) {
      console.error('❌ [MediaService] Delete failed:', {
        error: error.message,
        stack: error.stack,
        photoId,
      });
      throw new Error(`Failed to delete photo: ${error.message}`);
    }
  }

  async getCarouselImages(count: number = 6): Promise<any[]> {
    console.log('🎠 [MediaService] Fetching carousel images:', { count });
    
    try {
      // Use raw SQL query for better performance and RANDOM() support in PostgreSQL
      // Get random images (excluding videos) from all services
      const rawPhotos = await this.photos.query(`
        SELECT 
          p.id,
          p.title,
          p.url,
          p."serviceId",
          s.id as "service_id",
          s.title as "service_title",
          s.icon as "service_icon"
        FROM photos p
        LEFT JOIN services s ON p."serviceId" = s.id
        WHERE p."deletedAt" IS NULL
          AND p.url NOT LIKE '%.mp4'
          AND p.url NOT LIKE '%.webm'
          AND p.url NOT LIKE '%.ogg'
          AND p.url NOT LIKE '%video%'
        ORDER BY RANDOM()
        LIMIT $1
      `, [count * 2]); // Get more than needed for additional filtering
      
      // Additional client-side filtering for safety
      const images = rawPhotos
        .filter((photo: any) => {
          const isVideo = /\.(mp4|webm|ogg)$/i.test(photo.url) || photo.url.includes('video');
          return !isVideo && photo.url;
        })
        .slice(0, count); // Take exactly the requested count
      
      // Load full photo entities with relations for service data
      const photoIds = images.map((img: any) => img.id);
      const photos = photoIds.length > 0
        ? await this.photos.find({
            where: photoIds.map((id: string) => ({ id })),
            relations: ['service'],
          })
        : [];
      
      // Map to match the order from raw query
      const orderedPhotos = photoIds.map((id: string) => photos.find(p => p.id === id)).filter(Boolean) as Photo[];
      
      console.log('✅ [MediaService] Carousel images fetched:', {
        requested: count,
        rawPhotos: rawPhotos.length,
        imagesReturned: orderedPhotos.length,
      });
      
      return orderedPhotos.map((photo: Photo) => ({
        id: photo.id,
        url: photo.url,
        title: photo.title,
        serviceId: photo.service?.id || photo.serviceId,
        service: photo.service ? {
          id: photo.service.id,
          title: photo.service.title,
          icon: photo.service.icon,
        } : null,
      }));
    } catch (error: any) {
      console.error('❌ [MediaService] Failed to fetch carousel images:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to fetch carousel images: ${error.message}`);
    }
  }
}
