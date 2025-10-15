import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Comment } from 'src/comment/entity/comment.entity';
import { Media } from 'src/post/entity/media.entity';
import { Post } from 'src/post/entity/posts.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hashed

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatarUrl: string | null;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastSeen: Date | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'text', nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  website: string | null;

  @Column({ type: 'simple-array', nullable: true })
  interests: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 'local' })
  provider: 'local' | 'google';

  @Column({ type: 'json', nullable: true })
  settings: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string | null;
  } | null;

  @Column({ type: 'json', nullable: true })
  sessions:
    | {
        deviceId: string;
        ip: string;
        lastActive: Date;
      }[]
    | null;

  @ManyToMany(() => User, (user) => user.following)
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable({
    name: 'user_follows', // custom table name
    joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followed_id', referencedColumnName: 'id' },
  })
  following: User[];

  @ManyToMany(() => User)
  @JoinTable()
  blockedUsers: User[];

  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Media, (media) => media.owner)
  media: Media[];

  @Column({ default: 0 })
  postsCount: number;

  @Column({ default: 0 })
  followersCount: number;

  @Column({ default: 0 })
  followingsCount: number;
}
