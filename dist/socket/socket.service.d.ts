import { Server, Socket } from 'socket.io';
export declare class SocketService {
    private server;
    setServer(server: Server): void;
    emitToUser(userId: string, event: string, payload: any): Promise<void>;
    disconnectByJti(jti: string): Promise<void>;
    emitNotificationToUser(userId: string, ntf: any): void;
    emitUnreadCount(userId: string, unread: number): void;
    registerSocket(s: Socket): void;
    unregisterSocket(s: Socket): void;
}
