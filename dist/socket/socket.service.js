"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const common_1 = require("@nestjs/common");
const lineLogger_1 = require("../common/utils/lineLogger");
let SocketService = class SocketService {
    server;
    setServer(server) {
        this.server = server;
    }
    async emitToUser(userId, event, payload) {
        const logger = new lineLogger_1.LineLogger('emitToUser');
        logger.log(`Emitting notification to user:${userId}`, payload);
        this.server.to(`user:${userId}`).emit(event, payload);
    }
    async disconnectByJti(jti) {
        const sockets = await this.server.fetchSockets();
        sockets
            .filter((s) => s.data.tokenJti === jti)
            .forEach((s) => s.disconnect(true));
    }
    emitNotificationToUser(userId, ntf) {
        this.emitToUser(userId, 'notification', ntf);
    }
    emitUnreadCount(userId, unread) {
        this.emitToUser(userId, 'notifications:unreadCount', { unread });
    }
    registerSocket(s) {
    }
    unregisterSocket(s) {
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, common_1.Injectable)()
], SocketService);
//# sourceMappingURL=socket.service.js.map