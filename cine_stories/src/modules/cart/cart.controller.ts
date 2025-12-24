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
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsEventType } from '../../infrastructure/database/entities/analytics.entity';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly analytics: AnalyticsService,
  ) {}

  // Guest cart: No auth required - creates/uses guest user
  @Post()
  async addItem(@Req() req: any, @Body() body: { serviceId: string }) {
    const userId = req.user?.userId || await this.getOrCreateGuestUser(req);
    const result = await this.cartService.addItem(userId, body.serviceId);
    
    // Track analytics
    await this.analytics.trackEvent(
      AnalyticsEventType.ADD_TO_CART,
      userId,
      { serviceId: body.serviceId },
      req.cookies?.guestUserId || req.session?.guestUserId,
      req.headers['user-agent'],
      req.ip,
    );
    
    return result;
  }

  // Guest cart: No auth required
  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user?.userId || await this.getOrCreateGuestUser(req);
    return this.cartService.findAll(userId);
  }

  // Guest cart: No auth required
  @Patch(':id')
  async updateQuantity(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { id?: string; quantity: number },
  ) {
    const userId = req.user?.userId || await this.getOrCreateGuestUser(req);
    return this.cartService.updateQuantity(userId, id, body.quantity);
  }

  // Guest cart: No auth required
  @Delete(':id')
  async removeItem(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user?.userId || await this.getOrCreateGuestUser(req);
    return this.cartService.removeItem(userId, id);
  }

  // Helper: Get or create guest user for anonymous cart
  private async getOrCreateGuestUser(req: any): Promise<string> {
    // Check if we have a guest user ID in session/cookie
    const guestId = req.session?.guestUserId || req.cookies?.guestUserId;
    if (guestId) {
      return guestId;
    }
    
    // Create a new guest user
    const guestUser = await this.cartService.createGuestUser();
    
    // Store in session/cookie for future requests
    if (req.session) {
      req.session.guestUserId = guestUser.id;
    }
    
    // Set cookie for stateless requests
    if (req.res) {
      req.res.cookie('guestUserId', guestUser.id, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'lax',
      });
    }
    
    return guestUser.id;
  }
}

