"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const comment_service_1 = require("src/comment/comment.service");
describe('CommentService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [comment_service_1.CommentService],
        }).compile();
        service = module.get(comment_service_1.CommentService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=comment.service.spec.js.map