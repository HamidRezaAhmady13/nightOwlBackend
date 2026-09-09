import { LineLogger } from '@/common/utils/lineLogger';
import { SocketService } from '@/modules/socket/socket.service';
import { ConfigService } from '@nestjs/config';
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

@WebSocketGateway({
  path: '/socket.io',
  cors: {
    origin: ['https://127.0.0.1:3000', 'https://hamidreza-ahmadi.sbs'],
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  private readonly logger = new LineLogger();

  constructor(
    private readonly socketSvc: SocketService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit() {
    this.socketSvc.setServer(this.server);
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Connection attempt from client ${client.id}`);

      let token =
        (client.handshake.auth && (client.handshake.auth as any).token) || null;

      if (!token && client.handshake.headers.cookie) {
        const cookies = cookie.parse(client.handshake.headers.cookie);
        token = cookies.access || null;
      }

      if (!token) throw new Error('no token');

      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      client.data.userId = payload.sub ?? payload.userId ?? payload.id;
      client.data.tokenJti = payload.jti;

      client.join(`user:${client.data.userId}`);
      this.socketSvc.registerSocket(client);

      this.logger.log(`Client ${client.id} joined user:${client.data.userId}`);
    } catch (err) {
      this.logger.error(`Socket auth failed: ${(err as Error).message || err}`);

      client.emit('unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.socketSvc.unregisterSocket(client);
    this.logger.warn(
      `Client ${client.id} disconnected from user:${client.data.userId}`,
    );
  }
}
