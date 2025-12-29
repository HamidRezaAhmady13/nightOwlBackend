import { Post } from 'src/post/entity/posts.entity';
import { User } from 'src/user/entity/user.entity';
export declare class Comment {
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
}
