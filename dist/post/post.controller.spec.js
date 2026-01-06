"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const post_controller_1 = require("src/post/post.controller");
describe('PostController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [post_controller_1.PostController],
        }).compile();
        controller = module.get(post_controller_1.PostController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=post.controller.spec.js.map