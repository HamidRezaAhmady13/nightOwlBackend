import {
  CreateNotificationWithtypesDto,
  NotificationType,
} from 'src/notifications/dto/ntfDto';

export function buildNotification(dto: CreateNotificationWithtypesDto) {
  switch (dto.type) {
    case NotificationType.Follow:
      return {
        // type: 'follow',
        smallBody: 'Someone followed you',
        payloadRef: { followerId: dto.followerId },
      };
    case NotificationType.Like:
      return {
        // type: 'like',
        smallBody: 'Someone liked your post',
        payloadRef: { postId: dto.postId },
      };
    case NotificationType.Comment:
      return {
        // type: 'comment',
        smallBody: 'Someone commented on your post',
        payloadRef: { postId: dto.postId, commentId: dto.commentId },
      };
  }
}
