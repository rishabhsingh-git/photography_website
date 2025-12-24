import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem } from '../../infrastructure/database/entities/cart.entity';
import { Service } from '../../infrastructure/database/entities/service.entity';
import { User, UserRole, AuthProvider } from '../../infrastructure/database/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly cartItems: Repository<CartItem>,
    @InjectRepository(Service) private readonly services: Repository<Service>,
    @InjectRepository(User) private readonly users: Repository<User>,
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
      // Limit quantity to 1 - don't increase if already exists
      cartItem.quantity = 1;
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
    // Limit quantity to maximum 1
    cartItem.quantity = Math.min(quantity, 1);
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

  // Create a guest user for anonymous cart
  async createGuestUser(): Promise<User> {
    const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@guest.local`;
    const guestUser = this.users.create({
      email: guestEmail,
      provider: AuthProvider.LOCAL,
      roles: [UserRole.CLIENT],
      name: 'Guest User',
    });
    return this.users.save(guestUser);
  }

  // Merge guest cart into user cart when user logs in
  async mergeGuestCart(guestUserId: string, userId: string): Promise<void> {
    const guestItems = await this.cartItems.find({
      where: { user: { id: guestUserId } },
      relations: ['service'],
    });

    for (const guestItem of guestItems) {
      const existingItem = await this.cartItems.findOne({
        where: { user: { id: userId }, service: { id: guestItem.service.id } },
      });

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        await this.cartItems.save(existingItem);
        await this.cartItems.remove(guestItem);
      } else {
        guestItem.user = { id: userId } as any;
        await this.cartItems.save(guestItem);
      }
    }

    // Delete guest user after merging
    await this.users.delete({ id: guestUserId });
  }
}

