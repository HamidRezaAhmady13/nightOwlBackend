import { CommentService } from 'src/comment/comment.service';
import { CreateCommentDto } from 'src/comment/dto/CreateCommentDto';
import { User } from 'src/user/entity/user.entity';
export declare class CommentController {
    private readonly commentService;
    constructor(commentService: CommentService);
    getCommentsForPost(postId: string, user: {
        id: string;
    }, page?: number, limit?: number): Promise<{
        likedByCurrentUser: boolean;
        childComments: {
            likedByCurrentUser: boolean;
            id: string;
            text: string;
            author: User;
            post: import("../post/entity/posts.entity").Post;
            parentComment: import("./entity/comment.entity").Comment | null;
            childComments: import("./entity/comment.entity").Comment[];
            createdAt: Date;
            likedByUsers: User[];
            likeCount: number;
            replyCount: number;
        }[];
        id: string;
        text: string;
        author: User;
        post: import("../post/entity/posts.entity").Post;
        parentComment: import("./entity/comment.entity").Comment | null;
        createdAt: Date;
        likedByUsers: User[];
        likeCount: number;
        replyCount: number;
    }[]>;
    createComment(postId: string, user: User, dto: CreateCommentDto): Promise<import("./entity/comment.entity").Comment>;
    likeComment(id: string, user: User): Promise<import("./entity/comment.entity").Comment>;
    unlikeComment(id: string, user: User): Promise<import("./entity/comment.entity").Comment>;
    getReplies(commentId: string, user: User): Promise<{
        likedByCurrentUser: boolean;
        id: string;
        text: string;
        author: User;
        post: import("../post/entity/posts.entity").Post;
        parentComment: import("./entity/comment.entity").Comment | null;
        childComments: import("./entity/comment.entity").Comment[];
        createdAt: Date;
        likedByUsers: User[];
        likeCount: number;
        replyCount: number;
    }[]>;
    updateComment(commentId: string, user: User, text: string): Promise<import("./entity/comment.entity").Comment>;
    deleteComment(commentId: string, user: User): Promise<{
        message: string;
    }>;
}
