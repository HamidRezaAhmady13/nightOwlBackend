// user.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { NotificationType } from 'src/notifications/dto/ntfDto';
import { NotificationService } from 'src/notifications/notification.service';
import { RedisService } from 'src/redis/redis.service';
import { SocketService } from 'src/socket/socket.service';
import { StorageService } from 'src/storage/storage.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUserDto } from './dto/safe-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
  ) {}

  async followUser(currentUserId: string, targetUsername: string) {
    const qr = this.userRepo.manager.connection.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const target = await qr.manager.findOne(User, {
        where: { username: targetUsername },
        relations: ['followers'], // optional if you want to inspect
      });
      if (!target) throw new NotFoundException('Target user not found');

      const existing = await qr.manager.query(
        `SELECT 1 FROM user_follows WHERE follower_id = $1 AND followed_id = $2 FOR UPDATE`,
        [currentUserId, target.id],
      );

      if (existing.length === 0) {
        await qr.manager
          .createQueryBuilder()
          .relation(User, 'following')
          .of({ id: currentUserId })
          .add(target.id);

        await qr.manager.increment(
          User,
          { id: currentUserId },
          'followingsCount',
          1,
        );
        await qr.manager.increment(
          User,
          { id: target.id },
          'followersCount',
          1,
        );
      }

      await qr.commitTransaction();

      // fetch fresh state and update cache immediately
      const freshCurrent = await qr.manager.findOne(User, {
        where: { id: currentUserId },
        relations: ['following'],
      });
      const freshTarget = await qr.manager.findOne(User, {
        where: { id: target.id },
        select: ['id', 'username', 'avatarUrl'],
      });
      if (!freshCurrent)
        throw new NotFoundException('freshCurrent user not found');

      // atomically replace cache
      await this.redis.del(`user:${currentUserId}`);
      await this.redis.del(`user:uname:${freshCurrent.username}`);
      await this.redis.set(
        `user:${currentUserId}`,
        JSON.stringify(freshCurrent),
        10,
      );

      // 🔔 Notify target user (like in toggleLike)
      if (freshTarget && freshTarget.id !== currentUserId) {
        const ntf = await this.notificationService.createForUser(
          freshTarget.id,
          {
            type: NotificationType.Follow,
            sourceId: currentUserId,
            followerId: currentUserId,
          },
        );

        const unread = await this.notificationService.countUnreadForUser(
          freshTarget.id,
        );

        // emit via SocketService
        this.socketService.emitNotificationToUser(freshTarget.id, ntf);
        this.socketService.emitUnreadCount(freshTarget.id, unread);
      }

      // return server truth
      return { currentUser: freshCurrent };
    } catch (err) {
      try {
        await qr.rollbackTransaction();
      } catch {}
      if ((err as any).code === '23505') {
        /* duplicate key — treat as already-following */
      }
      throw err;
    } finally {
      await qr.release();
    }
  }

  async unfollowUser(currentUserId: string, targetUsername: string) {
    const qr = this.userRepo.manager.connection.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const target = await qr.manager.findOne(User, {
        where: { username: targetUsername },
      });
      if (!target) throw new NotFoundException('Target user not found');

      // lock the join row (if exists) to serialize concurrent ops for this pair
      const existing = await qr.manager.query(
        `SELECT 1 FROM user_follows WHERE follower_id = $1 AND followed_id = $2 FOR UPDATE`,
        [currentUserId, target.id],
      );

      // FOLLOW
      if (existing.length > 0) {
        await qr.manager
          .createQueryBuilder()
          .relation(User, 'following')
          .of({ id: currentUserId })
          .remove(target.id);

        await qr.manager.decrement(
          User,
          { id: currentUserId },
          'followingsCount',
          1,
        );
        await qr.manager.decrement(
          User,
          { id: target.id },
          'followersCount',
          1,
        );
      } else {
        // already following — nothing to do (or return early)
      }

      await qr.commitTransaction();
      // fetch fresh state and update cache immediately
      // after commit
      const freshCurrent = await qr.manager.findOne(User, {
        where: { id: currentUserId },
        relations: ['following'],
      });
      const freshTarget = await qr.manager.findOne(User, {
        where: { id: target.id },
        select: ['id', 'username', 'avatarUrl'],
      });
      if (!freshCurrent)
        throw new NotFoundException('freshCurrent user not found');
      // atomically replace cache: delete keys then set fresh JSON

      await this.redis.del(`user:${currentUserId}`);
      await this.redis.del(`user:uname:${freshCurrent.username}`);
      await this.redis.set(
        `user:${currentUserId}`,
        JSON.stringify(freshCurrent),
        10,
      ); // 1s TTL
      // return server truth
      return { currentUser: freshCurrent };
    } catch (err) {
      try {
        await qr.rollbackTransaction();
      } catch {}
      // handle unique-constraint error gracefully if it occurs
      if ((err as any).code === '23505') {
        /* duplicate key — treat as already-following */
      }
      throw err;
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findByUserId(id: string): Promise<User | null> {
    return this.userRepo.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOneBy({ username });
  }

  async removeAvatar(userId: string): Promise<void> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      // 2️⃣ Handle the `null` case
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (user.avatarUrl) {
      // 3️⃣ Delete from disk or cloud
      await this.storageService.delete(user.avatarUrl);

      // 4️⃣ Clear the DB column and save
      user.avatarUrl = null;
      await this.userRepo.save(user);
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });
    if (existing) {
      throw new ConflictException('Username or email already exists');
    }
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }

  async getMe(userId: string): Promise<SafeUserDto> {
    const id = String(userId);
    const ttlSeconds = Number(this.configService.get('USER_CACHE_TTL') ?? 600);
    const key = `user:${id}`;

    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached) as SafeUserDto;

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['following'],
      select: [
        'id',
        'email',
        'createdAt',
        'avatarUrl',
        'username',
        'bio',
        'location',
        'website',
        'settings',
      ],
    });
    if (!user) throw new NotFoundException('User not found');

    const safeUser = plainToInstance(SafeUserDto, user, {
      excludeExtraneousValues: true,
    });
    await this.redis.set(key, JSON.stringify(safeUser), ttlSeconds);

    return safeUser;
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<SafeUserDto> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    if (user.provider !== 'local' && dto.password) {
      throw new BadRequestException("OAuth users can't update password");
    }

    // 🔐 Hash password if provided
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepo.update(userId, dto);

    const updatedUser = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['following'],
    });

    await this.redis.del(`user:${userId}`);

    return plainToInstance(SafeUserDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async createOAuthUser(dto: Partial<CreateUserDto> & { provider: string }) {
    return this.userRepo.save(this.userRepo.create(dto));
  }

  async searchUsers(query: string, limit = 20, page = 1) {
    const [data, total] = await this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.avatarUrl'])
      .where('user.username ILIKE :exact')
      .orWhere('user.username ILIKE :partial')
      .orderBy(
        `
        CASE
          WHEN user.username ILIKE :exact THEN 0
          WHEN user.username ILIKE :startsWith THEN 1
          WHEN user.username ILIKE :endsWith THEN 3
          ELSE 2
        END
      `,
        'ASC',
      )
      .addOrderBy('user.username', 'ASC')
      .setParameters({
        exact: query,
        partial: `%${query}%`,
        startsWith: `${query}%`,
        endsWith: `%${query}`,
      })
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return { data, total };
  }

  async updateTheme(userId: string, theme: 'light' | 'dark') {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const old = user.settings ?? {
      notifications: false,
      theme: 'light',
      language: null,
    };
    user.settings = {
      notifications: old.notifications,
      theme,
      language: old.language,
    };

    const saved = await this.userRepo.save(user);
    await this.redis.del(`user:${userId}`); // <<< clear stale cache
    return saved;
  }

  // user.service.ts
  async findByEmailWithPassword(email: string) {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'provider'], // include only needed fields
    });
  }
}
