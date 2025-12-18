import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyFunction } from 'passport-facebook';

import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly auth: AuthService) {
    super({
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL: process.env.FB_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    const email = profile.emails?.[0]?.value;
    const oauthId = profile.id;
    const user = await this.auth.oauthLogin({ email, provider: 'facebook', oauthId });
    return user;
  }
}
