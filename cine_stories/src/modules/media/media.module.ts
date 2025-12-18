import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '../storage/storage.module';
import { Photo } from '../../infrastructure/database/entities/photo.entity';
import { Category } from '../../infrastructure/database/entities/category.entity';
import { Tag } from '../../infrastructure/database/entities/tag.entity';

import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([Photo, Category, Tag]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 },
      storage: null,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
