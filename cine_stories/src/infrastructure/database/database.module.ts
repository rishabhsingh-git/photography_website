import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Photo } from './entities/photo.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { Notification } from './entities/notification.entity';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Photo, Category, Tag, Notification, Payment])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
