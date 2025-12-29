"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNotification = buildNotification;
const ntfDto_1 = require("../../notifications/dto/ntfDto");
function buildNotification(dto) {
    switch (dto.type) {
        case ntfDto_1.NotificationType.Follow:
            return {
                smallBody: 'Someone followed you',
                payloadRef: { followerId: dto.followerId },
            };
        case ntfDto_1.NotificationType.Like:
            return {
                smallBody: 'Someone liked your post',
                payloadRef: { postId: dto.postId },
            };
        case ntfDto_1.NotificationType.Comment:
            return {
                smallBody: 'Someone commented on your post',
                payloadRef: { postId: dto.postId, commentId: dto.commentId },
            };
    }
}
//# sourceMappingURL=buildNotification.js.map