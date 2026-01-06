import { Post } from 'src/post/entity/posts.entity';
import { User } from 'src/user/entity/user.entity';
export declare class Media {
    id: string;
    type: 'image' | 'video' | 'file';
    url: string;
    owner: User;
    post: Post;
    uploadedAt: Date;
    isThumbnail: boolean;
    quality?: string;
}
