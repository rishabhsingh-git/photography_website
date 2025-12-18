import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

import { User, UserRole, AuthProvider } from '../../infrastructure/database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    console.log('email******************************************************************************', email);
    console.log('password******************************************************************************', password);
   const users = await this.users.find();
   console.log('users******************************************************************************', users);
    const user = await this.users.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash'],
    });
    console.log('user******************************************************************************', user);
    if (!user?.passwordHash) throw new UnauthorizedException('User not found or no password set');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    console.log('ok******************************************************************************', ok);
    return user;
  }

  async login(user: User) {
    // Fetch full user with roles (validateUser only returns id, email, passwordHash)
    const fullUser = await this.users.findOne({
      where: { id: user.id },
      select: ['id', 'email', 'roles'],
    });
    
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    
    const payload = { sub: fullUser.id, email: fullUser.email, roles: fullUser.roles };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        roles: fullUser.roles,
      },
    };
  }

  async oauthLogin(profile: { email: string; provider: string; oauthId: string }) {
    let user = await this.users.findOne({ where: { email: profile.email } });
    if (!user) {
      user = this.users.create({
        email: profile.email,
        provider: profile.provider as AuthProvider,
        oauthId: profile.oauthId,
        roles: [UserRole.CLIENT],
      });
      await this.users.save(user);
    }
    return this.login(user);
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.users.findOne({
      where: { id: userId },
      select: ['id', 'email', 'roles'],
    });
  }

  async upsertOtp(email: string, otp: string) {
    // pluggable OTP channel via Notification service or SMS provider; store hashed OTP only
    const hash = await argon2.hash(otp);
    await this.users.update({ email }, { passwordHash: hash });
  }
}
