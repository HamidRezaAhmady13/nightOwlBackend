"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const socket_service_1 = require("src/socket/socket.service");
describe('SocketService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [socket_service_1.SocketService],
        }).compile();
        service = module.get(socket_service_1.SocketService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=socket.service.spec.js.map