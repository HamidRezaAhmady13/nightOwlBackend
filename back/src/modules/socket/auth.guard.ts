import { AuthService } from '@/modules/auth/auth.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private authSvc: AuthService) {}
  async canActivate(ctx: ExecutionContext) {
    const client = ctx.switchToWs().getClient<Socket>();
    const payload = await this.authSvc.verifyJwt(client.handshake.auth?.token);
    if (!payload) return false;

    client.data.userId = payload.sub;
    client.data.tokenJti = payload.jti;
    return true;
  }
}
