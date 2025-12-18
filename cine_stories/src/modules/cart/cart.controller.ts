import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addItem(@Req() req: any, @Body() body: { serviceId: string }) {
    return this.cartService.addItem(req.user.userId, body.serviceId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.cartService.findAll(req.user.userId);
  }

  @Patch(':id')
  updateQuantity(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { id?: string; quantity: number },
  ) {
    return this.cartService.updateQuantity(req.user.userId, id, body.quantity);
  }

  @Delete(':id')
  removeItem(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.cartService.removeItem(req.user.userId, id);
  }
}

