// user.service.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
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

  async getMe(userId: string): Promise<User> {
    const cached = await this.cacheManager.get<User>(`user:${userId}`);
    if (cached) return cached;

    const user = await this.userRepo.findOne({
      where: { id: userId },
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
    await this.cacheManager.set(`user:${userId}`, user, 600 * 1000);
    return user;
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

    await this.cacheManager.del(`user:${userId}`);

    return plainToInstance(SafeUserDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  // async followUser(
  //   currentUserId: string,
  //   targetUsername: string,
  // ): Promise<{ message: string } | void> {
  //   const targetUser = await this.userRepo.findOneBy({
  //     username: targetUsername,
  //   });
  //   if (!targetUser) throw new NotFoundException('Target user not found');

  //   // relation API manipulates the DB join table directly and does not require loading arrays
  //   await this.userRepo
  //     .createQueryBuilder()
  //     .relation(User, 'following')
  //     .of(currentUserId)
  //     .add(targetUser.id);

  //   await this.cacheManager.del(`user:${currentUserId}`);
  //   await this.cacheManager.del(`user:${targetUser.id}`);

  //   return { message: `You are now following ${targetUsername}` };
  // }

  // async unfollowUser(
  //   currentUserId: string,
  //   targetUsername: string,
  // ): Promise<{ message: string } | void> {
  //   const targetUser = await this.userRepo.findOneBy({
  //     username: targetUsername,
  //   });
  //   if (!targetUser) throw new NotFoundException('Target user not found');

  //   await this.userRepo
  //     .createQueryBuilder()
  //     .relation(User, 'following')
  //     .of(currentUserId)
  //     .remove(targetUser.id);

  //   await this.cacheManager.del(`user:${currentUserId}`);
  //   await this.cacheManager.del(`user:${targetUser.id}`);

  //   return { message: `You have unfollowed ${targetUsername}` };
  // }

  // in UserService (or where follow/unfollow live)
  async followUser(currentUserId: string, targetUsername: string) {
    const queryRunner = this.userRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const targetUser = await queryRunner.manager.findOne(User, {
        where: { username: targetUsername },
      });
      if (!targetUser) throw new NotFoundException('Target user not found');

      // add relation (will insert into user_follows)
      await queryRunner.manager
        .createQueryBuilder()
        .relation(User, 'following')
        .of(currentUserId)
        .add(targetUser.id);

      // increment counts atomically
      await queryRunner.manager.increment(
        User,
        { id: currentUserId },
        'followingsCount',
        1,
      );
      await queryRunner.manager.increment(
        User,
        { id: targetUser.id },
        'followersCount',
        1,
      );

      await queryRunner.commitTransaction();

      // invalidate caches after commit
      await this.cacheManager.del(`user:${currentUserId}`);
      await this.cacheManager.del(`user:${targetUser.id}`);

      return { message: `You are now following ${targetUsername}` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async unfollowUser(currentUserId: string, targetUsername: string) {
    const queryRunner = this.userRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const targetUser = await queryRunner.manager.findOne(User, {
        where: { username: targetUsername },
      });
      if (!targetUser) throw new NotFoundException('Target user not found');

      // remove relation
      await queryRunner.manager
        .createQueryBuilder()
        .relation(User, 'following')
        .of(currentUserId)
        .remove(targetUser.id);

      // decrement counts atomically (guard against negative)
      await queryRunner.manager.decrement(
        User,
        { id: currentUserId },
        'followingsCount',
        1,
      );
      await queryRunner.manager.decrement(
        User,
        { id: targetUser.id },
        'followersCount',
        1,
      );

      await queryRunner.commitTransaction();

      // invalidate caches after commit
      await this.cacheManager.del(`user:${currentUserId}`);
      await this.cacheManager.del(`user:${targetUser.id}`);

      return { message: `You have unfollowed ${targetUsername}` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createOAuthUser(dto: Partial<CreateUserDto> & { provider: string }) {
    return this.userRepo.save(this.userRepo.create(dto));
  }

  async searchUsers(query: string, limit = 20, page = 1) {
    console.log(query);

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
    // Merge existing settings with new theme
    user.settings = {
      notifications: old.notifications,
      theme, // your new theme
      language: old.language,
    };

    return this.userRepo.save(user);
  }
}
