import { Comment } from 'src/comment/entity/comment.entity';
import { NotificationService } from 'src/notifications/notification.service';
import { Post } from 'src/post/entity/posts.entity';
import { RedisService } from 'src/redis/redis.service';
import { SocketService } from 'src/socket/socket.service';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
export declare class CommentService {
    private readonly commentRepo;
    private readonly postRepo;
    private readonly userRepo;
    private readonly notificationService;
    private readonly redis;
    private readonly socketService;
    constructor(commentRepo: Repository<Comment>, postRepo: Repository<Post>, userRepo: Repository<User>, notificationService: NotificationService, redis: RedisService, socketService: SocketService);
    createComment(text: string, postId: string, author: User, parentCommentId?: string): Promise<Comment>;
    getCommentsForPost(postId: string, currentUserId: string, page?: number, limit?: number): Promise<{
        likedByCurrentUser: boolean;
        childComments: {
            likedByCurrentUser: boolean;
            id: string;
            text: string;
            author: User;
            post: Post;
            parentComment: Comment | null;
            childComments: Comment[];
            createdAt: Date;
            likedByUsers: User[];
            likeCount: number;
            replyCount: number;
        }[];
        id: string;
        text: string;
        author: User;
        post: Post;
        parentComment: Comment | null;
        createdAt: Date;
        likedByUsers: User[];
        likeCount: number;
        replyCount: number;
    }[]>;
    getReplies(commentId: string, currentUserId: string): Promise<{
        likedByCurrentUser: boolean;
        id: string;
        text: string;
        author: User;
        post: Post;
        parentComment: Comment | null;
        childComments: Comment[];
        createdAt: Date;
        likedByUsers: User[];
        likeCount: number;
        replyCount: number;
    }[]>;
    updateComment(commentId: string, userId: string, text: string): Promise<Comment>;
    deleteComment(commentId: string, userId: string): Promise<{
        message: string;
    }>;
    likeComment(commentId: string, userId: string): Promise<Comment>;
    unlikeComment(commentId: string, userId: string): Promise<Comment>;
}
