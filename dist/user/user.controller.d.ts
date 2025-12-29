import { Request, Response } from 'express';
import { PostService } from 'src/post/post.service';
import { RedisService } from 'src/redis/redis.service';
import { SafeUserDto } from 'src/user/dto/safe-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
export declare class UserController {
    private readonly userService;
    private readonly postService;
    private readonly redis;
    constructor(userService: UserService, postService: PostService, redis: RedisService);
    getMe(user: User, res: Response): Promise<SafeUserDto>;
    updateTheme(req: any, theme: 'light' | 'dark', res: Response): Promise<User>;
    updateProfile(avatar: Express.Multer.File, updateDto: UpdateUserDto, currentUser: User): Promise<SafeUserDto>;
    getProfile(req: Request): Express.User;
    fullSearch(query: string, limit?: number, page?: number): Promise<{
        data: User[];
        total: number;
    }>;
    deleteAvatar(userId: string, req: Request): Promise<{
        message: string;
    }>;
    followUser(username: string, currentUser: User): Promise<{
        currentUser: User;
    }>;
    unfollowUser(username: string, currentUser: User): Promise<{
        currentUser: User;
    }>;
    getUserById(userId: string): Promise<User | null>;
    getPostsByUsername(username: string, limit?: string, cursor?: string): Promise<{
        items: {
            id: string;
            imageUrl: any;
            createdAt: Date;
            likesCount: number;
            commentsCount: number;
        }[];
        nextCursor: string | null;
    }>;
    getUser(username: string): Promise<User | null>;
}
