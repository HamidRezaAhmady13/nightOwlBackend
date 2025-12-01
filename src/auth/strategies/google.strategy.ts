import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('CLIENT_ID');
    const clientSecret = configService.get<string>('CLIENT_SECRET');
    if (!clientID || !clientSecret)
      throw new Error('clientID or clientSecret  or both are missing!');
    super({
      clientID,
      clientSecret,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      // include openid to ensure email/id claims are returned consistently
      scope: ['openid', 'profile', 'email'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    // Try multiple places for email (profile.emails, raw JSON). If absent,
    // synthesize one so signup can proceed; log minimal context for debugging.
    let email = profile.emails?.[0]?.value;
    if (!email && (profile as any)._json && (profile as any)._json.email) {
      email = (profile as any)._json.email;
    }

    if (!email) {
      console.warn(
        `GoogleStrategy: email missing for profile id=${profile.id}, proceeding with synthetic email`,
      );
      email = `${profile.id}@google.local`;
    }

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) return existingUser;

    const { name, photos } = profile;

    const createUserDto: CreateUserDto = {
      username: email.split('@')[0],
      email,
      password: Math.random().toString(36).slice(-8),
      avatarUrl: photos?.[0]?.value,
      bio:
        `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim() +
        ' via Google',
    };

    const newUser = await this.userService.createUser({
      ...createUserDto,
      password: '',
      provider: 'google',
    });

    // For Nest + Passport integration, return the user instead of calling done()
    return newUser;
  }
}
