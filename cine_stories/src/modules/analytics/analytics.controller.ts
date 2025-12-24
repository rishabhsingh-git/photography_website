import { Controller, Get, Post, Query, Param, UseGuards, Req, Body } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEventType } from '../../infrastructure/database/entities/analytics.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  // Public endpoint for tracking events
  @Post('track')
  async trackEvent(
    @Req() req: any,
    @Body() body: { eventType: AnalyticsEventType; metadata?: Record<string, unknown>; page?: string },
  ) {
    const userId = req.user?.userId || null;
    const sessionId = req.cookies?.guestUserId || req.session?.guestUserId || null;
    
    await this.analytics.trackEvent(
      body.eventType,
      userId,
      body.metadata,
      sessionId,
      req.headers['user-agent'],
      req.ip,
    );
    
    return { success: true };
  }

  @UseGuards(AdminGuard)
  @Get('funnel')
  async getFunnel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analytics.getFunnelData(start, end);
  }

  @UseGuards(AdminGuard)
  @Get('payments-by-customer')
  async getPaymentsByCustomer() {
    return this.analytics.getPaymentsByCustomer();
  }

  @UseGuards(AdminGuard)
  @Get('daily-stats')
  async getDailyStats(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.analytics.getDailyStats(daysNum);
  }

  @UseGuards(AdminGuard)
  @Get('user-journey/:userId')
  async getUserJourney(@Param('userId') userId: string) {
    return this.analytics.getUserJourney(userId);
  }
}
