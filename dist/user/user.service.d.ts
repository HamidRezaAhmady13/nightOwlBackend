import { ConfigService } from '@nestjs/config';
import { NotificationService } from 'src/notifications/notification.service';
import { RedisService } from 'src/redis/redis.service';
import { SocketService } from 'src/socket/socket.service';
import { StorageService } from 'src/storage/storage.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { SafeUserDto } from 'src/user/dto/safe-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
export declare class UserService {
    private readonly userRepo;
    private readonly storageService;
    private readonly configService;
    private readonly redis;
    private readonly socketService;
    private readonly notificationService;
    constructor(userRepo: Repository<User>, storageService: StorageService, configService: ConfigService, redis: RedisService, socketService: SocketService, notificationService: NotificationService);
    followUser(currentUserId: string, targetUsername: string): Promise<{
        currentUser: User;
    }>;
    unfollowUser(currentUserId: string, targetUsername: string): Promise<{
        currentUser: User;
    }>;
    findAll(): Promise<User[]>;
    findByUserId(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    removeAvatar(userId: string): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    createUser(userData: Partial<User>): Promise<User>;
    remove(id: number): Promise<void>;
    getMe(userId: string): Promise<SafeUserDto>;
    updateUser(userId: string, dto: UpdateUserDto): Promise<SafeUserDto>;
    createOAuthUser(dto: Partial<CreateUserDto> & {
        provider: string;
    }): Promise<User>;
    searchUsers(query: string, limit?: number, page?: number): Promise<{
        data: User[];
        total: number;
    }>;
    updateTheme(userId: string, theme: 'light' | 'dark'): Promise<User>;
    findByEmailWithPassword(email: string): Promise<User | null>;
}
