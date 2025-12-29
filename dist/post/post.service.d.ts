import { EntityManager, Repository } from 'typeorm';
import { MediaService } from 'src/media/media.service';
import { NotificationService } from 'src/notifications/notification.service';
import { CreatePostDto } from 'src/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/post/dto/update-post.dto';
import { Media } from 'src/post/entity/media.entity';
import { Post } from 'src/post/entity/posts.entity';
import { RedisService } from 'src/redis/redis.service';
import { SocketService } from 'src/socket/socket.service';
import { User } from 'src/user/entity/user.entity';
export declare class PostService {
    private readonly postRepository;
    private readonly mediaRepository;
    private readonly userRepository;
    private readonly mediaService;
    private readonly redis;
    private readonly socketService;
    private readonly notificationService;
    constructor(postRepository: Repository<Post>, mediaRepository: Repository<Media>, userRepository: Repository<User>, mediaService: MediaService, redis: RedisService, socketService: SocketService, notificationService: NotificationService);
    private readonly logger;
    getPostsCursor(userId: string, opts: {
        limit?: number;
        cursor?: string;
    }): Promise<{
        items: {
            id: string;
            imageUrl: any;
            createdAt: Date;
            likesCount: number;
            commentsCount: number;
        }[];
        nextCursor: string | null;
    }>;
    saveMediaRow(data: Partial<Media>, manager?: EntityManager): Promise<Media>;
    saveMediaBatch(items: Partial<Media>[], manager?: EntityManager): Promise<Media[]>;
    createPost(dto: CreatePostDto, user: User, media?: Express.Multer.File): Promise<Post>;
    getAllPosts(userId: string, opts: {
        limit: number;
        page: number;
    }): Promise<{
        items: {
            id: string;
            imageUrl: string;
            createdAt: Date;
            likesCount: number;
            commentsCount: number;
        }[];
        total: number;
    }>;
    getPost(postId: string): Promise<Post>;
    updatePost(postId: string, dto: UpdatePostDto, currentUserId: string, newMedia?: Express.Multer.File): Promise<Post>;
    deletePost(postId: string, currentUserId: string): Promise<{
        message: string;
    }>;
    getFeed(currentUserId: string, limit?: number, page?: number): Promise<{
        items: Post[];
        total: number;
    }>;
    toggleLike(postId: string, user: User): Promise<{
        liked: boolean;
        post?: undefined;
    } | {
        liked: boolean;
        post: Post;
    }>;
    getLikes(postId: string, page?: number, limit?: number): Promise<User[]>;
}
