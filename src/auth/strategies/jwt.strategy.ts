import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { RevocationService } from '../revocation.service';

const cookieExtractor: JwtFromRequestFunction = (req: any) =>
  req?.cookies?.access || null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly revocation: RevocationService,
    private readonly config: ConfigService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    if (payload.jti && (await this.revocation.isRevoked(payload.jti)))
      throw new UnauthorizedException('Token revoked');
    // return { id: String(payload.sub), email: payload.email };
    return { id: String(payload.sub) };
  }
}
