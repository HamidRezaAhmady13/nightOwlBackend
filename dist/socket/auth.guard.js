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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("src/auth/auth.service");
let SocketAuthGuard = class SocketAuthGuard {
    authSvc;
    constructor(authSvc) {
        this.authSvc = authSvc;
    }
    async canActivate(ctx) {
        const client = ctx.switchToWs().getClient();
        const payload = await this.authSvc.verifyJwt(client.handshake.auth?.token);
        if (!payload)
            return false;
        client.data.userId = payload.sub;
        client.data.tokenJti = payload.jti;
        return true;
    }
};
exports.SocketAuthGuard = SocketAuthGuard;
exports.SocketAuthGuard = SocketAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], SocketAuthGuard);
//# sourceMappingURL=auth.guard.js.map