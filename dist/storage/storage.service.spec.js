"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const storage_service_1 = require("src/storage/storage.service");
describe('StorageService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [storage_service_1.StorageService],
        }).compile();
        service = module.get(storage_service_1.StorageService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=storage.service.spec.js.map