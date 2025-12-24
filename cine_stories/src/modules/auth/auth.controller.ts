import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: any) {
    return this.auth.login(req.user);
  }

  @UseGuards(AuthGuard('google'))
  @Post('oauth/google')
  google(@Req() req: any) {
    return this.auth.login(req.user);
  }

  @UseGuards(AuthGuard('facebook'))
  @Post('oauth/facebook')
  facebook(@Req() req: any) {
    return this.auth.login(req.user);
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body() body: { email: string; otp: string },
    @Session() session: Record<string, any>,
  ) {
    const hashed = session[`otp:${body.email}`];
    if (!hashed) throw new UnauthorizedException('OTP missing');
    // critical: OTP verification uses constant-time hash to avoid timing leaks
    const user = await this.auth.validateUser(body.email, body.otp);
    delete session[`otp:${body.email}`];
    return this.auth.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const user = await this.auth.getUserById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  refresh(@Req() req: any) {
    return this.auth.refreshToken(req.user.userId || req.user.id);
  }
}
