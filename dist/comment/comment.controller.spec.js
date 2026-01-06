"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const comment_controller_1 = require("src/comment/comment.controller");
describe('CommentController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [comment_controller_1.CommentController],
        }).compile();
        controller = module.get(comment_controller_1.CommentController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=comment.controller.spec.js.map