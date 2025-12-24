import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 [AuthService] validateUser called');
    console.log('   Email received:', email);
    console.log('   Email length:', email.length);
    console.log('   Password received:', password ? '***' : 'MISSING');
    
    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    console.log('   Normalized email:', normalizedEmail);
    console.log('   Normalized length:', normalizedEmail.length);
    
    // DEBUG: Check ALL users in database first
    const allUsers = await this.users.find({
      select: ['id', 'email', 'deletedAt'],
      withDeleted: true,
    });
    console.log('📊 [DEBUG] Total users in database:', allUsers.length);
    allUsers.forEach((u, idx) => {
      console.log(`   ${idx + 1}. Email: "${u.email}" (deleted: ${!!u.deletedAt})`);
    });
    
    // Try to find user - first with normalized email
    let user = await this.users.findOne({
      where: { email: normalizedEmail, deletedAt: IsNull() },
      select: ['id', 'email', 'passwordHash', 'roles'],
    });
    
    console.log('🔍 [DEBUG] Query result with normalized email:', user ? 'FOUND' : 'NOT FOUND');
    
    // If not found, try with original email (case-sensitive)
    if (!user) {
      console.log('🔍 [DEBUG] Trying with original email (case-sensitive)...');
      user = await this.users.findOne({
        where: { email: email.trim(), deletedAt: IsNull() },
        select: ['id', 'email', 'passwordHash', 'roles'],
      });
      console.log('🔍 [DEBUG] Query result with original email:', user ? 'FOUND' : 'NOT FOUND');
    }
    
    // If still not found, try case-insensitive with query builder
    if (!user) {
      console.log('🔍 [DEBUG] Trying case-insensitive query builder...');
      user = await this.users
        .createQueryBuilder('user')
        .where('LOWER(TRIM(user.email)) = LOWER(TRIM(:email))', { email })
        .andWhere('user.deletedAt IS NULL')
        .addSelect('user.passwordHash')
        .getOne();
      console.log('🔍 [DEBUG] Query builder result:', user ? 'FOUND' : 'NOT FOUND');
    }
    
    // If still not found, check if user exists but is deleted
    if (!user) {
      const deletedUser = await this.users.findOne({
        where: { email: normalizedEmail },
        withDeleted: true,
        select: ['id', 'email', 'deletedAt'],
      });
      if (deletedUser) {
        console.log('⚠️  [DEBUG] User exists but is DELETED:', {
          id: deletedUser.id,
          email: deletedUser.email,
          deletedAt: deletedUser.deletedAt,
        });
      }
    }
    
    console.log('🔐 [AuthService] Final user result:', user ? {
      id: user.id,
      email: user.email,
      emailLength: user.email.length,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length || 0,
      roles: user.roles,
    } : 'NULL - USER NOT FOUND');
    
    if (!user) {
      console.log('❌ [AuthService] User not found in database');
      console.log('   Searched for:', normalizedEmail);
      throw new UnauthorizedException('User not found');
    }
    
    if (!user.passwordHash) {
      console.log('❌ [AuthService] User has no password hash');
      console.log('   User ID:', user.id);
      console.log('   User email:', user.email);
      throw new UnauthorizedException('User not found or no password set');
    }
    
    console.log('🔐 [AuthService] Verifying password...');
    const ok = await argon2.verify(user.passwordHash, password);
    console.log('🔐 [AuthService] Password verification result:', ok ? '✅ VALID' : '❌ INVALID');
    
    if (!ok) {
      console.log('❌ [AuthService] Password verification failed');
      throw new UnauthorizedException('Invalid credentials');
    }
    
    console.log('✅ [AuthService] User validated successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '15d') as any,
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

  async refreshToken(userId: string) {
    // Fetch full user with roles
    const fullUser = await this.users.findOne({
      where: { id: userId },
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
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '15d') as any,
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

  async upsertOtp(email: string, otp: string) {
    // pluggable OTP channel via Notification service or SMS provider; store hashed OTP only
    const hash = await argon2.hash(otp);
    await this.users.update({ email }, { passwordHash: hash });
  }
}
