import { Comment } from 'src/comment/entity/comment.entity';
import { Media } from 'src/post/entity/media.entity';
import { User } from 'src/user/entity/user.entity';
export declare class Post {
    id: string;
    content: string;
    owner: User;
    createdAt: Date;
    media: Media[];
    comments: Comment[];
    likedBy: User[];
    likesCount: number;
    commentsCount: number;
}
