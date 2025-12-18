import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartItem } from '../../infrastructure/database/entities/cart.entity';
import { Service } from '../../infrastructure/database/entities/service.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Service])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}

