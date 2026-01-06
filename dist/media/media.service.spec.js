"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const media_service_1 = require("src/media/media.service");
describe('MediaService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [media_service_1.MediaService],
        }).compile();
        service = module.get(media_service_1.MediaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=media.service.spec.js.map