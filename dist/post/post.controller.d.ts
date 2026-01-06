import { CreatePostDto } from 'src/post/dto/create-post.dto';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entity/user.entity';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    createPost(createPostDto: CreatePostDto, user: User, media?: Express.Multer.File): Promise<import("./entity/posts.entity").Post>;
    getFeed(user: {
        id?: string;
        userId?: string;
    }, limit: number, page: number): Promise<{
        items: import("./entity/posts.entity").Post[];
        total: number;
    }>;
    getPostsCursor(user: User, limit?: string, cursor?: string): Promise<{
        items: {
            id: string;
            imageUrl: any;
            createdAt: Date;
            likesCount: number;
            commentsCount: number;
        }[];
        nextCursor: string | null;
    }>;
    toggleLike(postId: string, user: User): Promise<{
        liked: boolean;
        post?: undefined;
    } | {
        liked: boolean;
        post: import("./entity/posts.entity").Post;
    }>;
    getPostById(id: string): Promise<import("./entity/posts.entity").Post>;
}
