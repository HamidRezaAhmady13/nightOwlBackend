import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization || request.cookies?.access;
    if (!token) return true;

    try {
      const result = (await super.canActivate(context)) as boolean;
      return result;
    } catch {
      // If token invalid, still allow but user stays undefined
      return true;
    }
  }

  handleRequest(err, user) {
    // Return user even if err; if no user, return null
    return user || null;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private static lastLog = new Map<string, number>();

  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();

      const authHeader = req.headers?.authorization as string | undefined;
      const accessCookie = req.cookies?.access as string | undefined;

      const tokenVal = authHeader
        ? authHeader.replace(/^Bearer\s+/i, '')
        : accessCookie;
      if (tokenVal) {
        const prefix = tokenVal.slice(0, 10);
        const key = `tok:${prefix}`;
        const now = Date.now();
        const last = JwtAuthGuard.lastLog.get(key) ?? 0;
        if (now - last > 10_000) {
          JwtAuthGuard.lastLog.set(key, now);
        }
      }
    } catch (e) {}
    return super.canActivate(context as any) as Promise<boolean>;
  }

  handleRequest(err, user, info) {
    const infoMsg = info ? (info.message ?? String(info)) : 'no-info';
    const key = infoMsg;
    const now = Date.now();
    const last = JwtAuthGuard.lastLog.get(key) ?? 0;

    if (!user) {
      let customMsg = infoMsg;
      if (infoMsg === 'jwt expired') customMsg = 'ACCESS_TOKEN_EXPIRED';
      else if (infoMsg === 'invalid signature')
        customMsg = 'ACCESS_TOKEN_INVALID';
      else if (infoMsg === 'No auth token') customMsg = 'NO_ACCESS_TOKEN';
      throw new UnauthorizedException({ message: customMsg, code: customMsg });
    }

    if (now - (JwtAuthGuard.lastLog.get('success') ?? 0) > 60_000) {
      JwtAuthGuard.lastLog.set('success', now);
    }

    return user;
  }
}

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err, user, info) {
    if (!user) {
      if (info?.message === 'jwt expired') {
        throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
      }
      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('NO_REFRESH_TOKEN');
      }
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }
    return user;
  }
}
