"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const cookie = require("cookie");
const socket_io_1 = require("socket.io");
const socket_service_1 = require("src/socket/socket.service");
let SocketGateway = SocketGateway_1 = class SocketGateway {
    socketSvc;
    jwtService;
    server;
    logger = new common_1.Logger(SocketGateway_1.name);
    constructor(socketSvc, jwtService) {
        this.socketSvc = socketSvc;
        this.jwtService = jwtService;
    }
    afterInit() {
        this.socketSvc.setServer(this.server);
        this.logger.log('Socket.IO initialized');
    }
    async handleConnection(client) {
        try {
            let token = (client.handshake.auth && client.handshake.auth.token) || null;
            if (!token && client.handshake.headers.cookie) {
                const cookies = cookie.parse(client.handshake.headers.cookie);
                token = cookies.access || cookies.refresh;
            }
            if (!token)
                throw new Error('no token');
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            client.data.userId = payload.sub ?? payload.userId ?? payload.id;
            client.data.tokenJti = payload.jti;
            client.join(`user:${client.data.userId}`);
            this.socketSvc.registerSocket(client);
            this.logger.log(`Client ${client.id} joined user:${client.data.userId}`);
        }
        catch (err) {
            client.emit('unauthorized');
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.socketSvc.unregisterSocket(client);
        this.logger.log(`Client disconnected: ${client.id}`);
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
exports.SocketGateway = SocketGateway = SocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        path: '/socket.io',
        cors: {
            origin: 'http://localhost:3001',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [socket_service_1.SocketService,
        jwt_1.JwtService])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map