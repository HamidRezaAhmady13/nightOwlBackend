import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LineLogger } from 'src/common/utils/lineLogger';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>('JWT_REFRESH_SECRET');
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.refresh || null,
      ]),
      secretOrKey: secret, // now guaranteed string
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    new LineLogger('validate').log('payload', payload);

    return { id: String(payload.sub) };
  }
}
