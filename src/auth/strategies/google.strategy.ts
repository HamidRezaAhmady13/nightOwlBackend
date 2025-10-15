import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ): Promise<any> {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new Error('Email not found in Google profile');

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) return done(null, existingUser);
    const { name, photos } = profile;

    const createUserDto: CreateUserDto = {
      username: email.split('@')[0], // or generate a unique one
      email,
      password: Math.random().toString(36).slice(-8), // 🔐 random password
      avatarUrl: photos?.[0]?.value,
      bio: `${name?.givenName} ${name?.familyName} via Google`,
    };
    const newUser = await this.userService.createUser({
      ...createUserDto,
      password: '', // or null — not used for OAuth
      provider: 'google', // ✅ THIS is where you set it
    });

    done(null, newUser);
  }
}
