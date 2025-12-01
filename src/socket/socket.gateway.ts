import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({
  path: '/socket.io',
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly socketSvc: SocketService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    this.socketSvc.setServer(this.server);
    this.logger.log('Socket.IO initialized');
  }

  async handleConnection(client: Socket) {
    try {
      let token =
        (client.handshake.auth && (client.handshake.auth as any).token) || null;

      if (!token && client.handshake.headers.cookie) {
        const cookies = cookie.parse(client.handshake.headers.cookie);
        token = cookies.access || cookies.refresh;
      }

      if (!token) throw new Error('no token');

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.sub ?? payload.userId ?? payload.id;
      client.data.tokenJti = payload.jti;

      client.join(`user:${client.data.userId}`);
      this.socketSvc.registerSocket(client);

      this.logger.log(`Client ${client.id} joined user:${client.data.userId}`);
    } catch (err) {
      client.emit('unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.socketSvc.unregisterSocket(client);
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
