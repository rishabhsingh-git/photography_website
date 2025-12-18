import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem } from '../../infrastructure/database/entities/cart.entity';
import { Service } from '../../infrastructure/database/entities/service.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly cartItems: Repository<CartItem>,
    @InjectRepository(Service) private readonly services: Repository<Service>,
  ) {}

  async addItem(userId: string, serviceId: string): Promise<CartItem> {
    const service = await this.services.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    let cartItem = await this.cartItems.findOne({
      where: { user: { id: userId }, service: { id: serviceId } },
      relations: ['service'],
    });

    if (cartItem) {
      cartItem.quantity += 1;
      return this.cartItems.save(cartItem);
    }

    cartItem = this.cartItems.create({
      user: { id: userId } as any,
      service: { id: serviceId } as any,
      quantity: 1,
    });
    return this.cartItems.save(cartItem);
  }

  async findAll(userId: string): Promise<CartItem[]> {
    return this.cartItems.find({
      where: { user: { id: userId } },
      relations: ['service'],
    });
  }

  async updateQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartItem> {
    const cartItem = await this.cartItems.findOne({
      where: { id: cartItemId, user: { id: userId } },
      relations: ['service'],
    });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }
    cartItem.quantity = quantity;
    return this.cartItems.save(cartItem);
  }

  async removeItem(userId: string, cartItemId: string): Promise<void> {
    const cartItem = await this.cartItems.findOne({
      where: { id: cartItemId, user: { id: userId } },
    });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }
    await this.cartItems.remove(cartItem);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartItems.delete({ user: { id: userId } });
  }
}

