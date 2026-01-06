import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from 'src/socket/socket.service';
export declare class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly socketSvc;
    private readonly jwtService;
    server: Server;
    private readonly logger;
    constructor(socketSvc: SocketService, jwtService: JwtService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
}
