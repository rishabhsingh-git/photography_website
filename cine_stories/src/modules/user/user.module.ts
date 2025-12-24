import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../infrastructure/database/entities/user.entity';
import { Payment } from '../../infrastructure/database/entities/payment.entity';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Payment])],
  controllers: [UserController],
  exports: [],
})
export class UserModule {}

