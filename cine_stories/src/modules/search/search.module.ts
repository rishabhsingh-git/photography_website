import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Photo } from '../../infrastructure/database/entities/photo.entity';

import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
