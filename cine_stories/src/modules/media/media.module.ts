import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '../storage/storage.module';
import { Photo } from '../../infrastructure/database/entities/photo.entity';
import { Category } from '../../infrastructure/database/entities/category.entity';
import { Tag } from '../../infrastructure/database/entities/tag.entity';
import { Service } from '../../infrastructure/database/entities/service.entity';

import { MediaService } from './media.service';
import { MediaController, AssetsController } from './media.controller';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([Photo, Category, Tag, Service]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 },
      storage: null,
    }),
  ],
  controllers: [MediaController, AssetsController],
  providers: [MediaService],
})
export class MediaModule {}
