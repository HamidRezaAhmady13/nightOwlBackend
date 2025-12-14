import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LineLogger } from 'src/common/utils/lineLogger';

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
        // Log the token being checked for debugging

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
    const logger = new LineLogger('handleRequest');

    // logger.log(infoMsg);
    if (!user) {
      let customMsg = infoMsg;
      if (infoMsg === 'jwt expired') {
        customMsg = 'ACCESS_TOKEN_EXPIRED'; // or any string you want
      } else if (infoMsg === 'invalid signature') {
        customMsg = 'ACCESS_TOKEN_INVALID';
      }

      logger.warn('JwtAuthGuard: no user', {
        info: infoMsg,
        err: err ? (err.message ?? String(err)) : null,
      });
      // logger.log(customMsg);
      // console.warn('JwtAuthGuard triggered' , infoMsg);

      throw new UnauthorizedException(customMsg);
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
