import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
      if (now - last > 10_000) {
        console.warn('JwtAuthGuard: no user', {
          info: infoMsg,
          err: err ? (err.message ?? String(err)) : null,
        });
        JwtAuthGuard.lastLog.set(key, now);
      }

      // THROW here so Nest returns 401 and your client interceptor can trigger refresh
      throw new UnauthorizedException(infoMsg);
    }

    if (now - (JwtAuthGuard.lastLog.get('success') ?? 0) > 60_000) {
      JwtAuthGuard.lastLog.set('success', now);
    }

    return user;
  }
}
