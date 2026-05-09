import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LineLogger } from 'src/common/utils/lineLogger';

@Injectable()
export class SocketService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  async emitToUser(userId: string, event: string, payload: any) {
    const logger = new LineLogger('emitToUser');
    logger.log(`Emitting notification to user:${userId}`, payload);

    this.server.to(`user:${userId}`).emit(event, payload);
  }

  async disconnectByJti(jti: string) {
    const sockets = await this.server.fetchSockets();
    sockets
      .filter((s) => s.data.tokenJti === jti)
      .forEach((s) => s.disconnect(true));
  }

  emitNotificationToUser(userId: string, ntf: any) {
    this.emitToUser(userId, 'notification', ntf);
  }

  emitUnreadCount(userId: string, unread: number) {
    this.emitToUser(userId, 'notifications:unreadCount', { unread });
  }

  registerSocket(s: Socket) {
    // optional bookkeeping, metrics
  }

  unregisterSocket(s: Socket) {
    // cleanup
  }
}
