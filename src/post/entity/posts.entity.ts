import { Comment } from 'src/comment/entity/comment.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Media } from './media.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string; // text content of post

  @ManyToOne(() => User, (user) => user.posts)
  @Index()
  owner: User;

  @OneToMany(() => Media, (media) => media.post)
  media: Media[];

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @ManyToMany(() => User)
  @JoinTable()
  likedBy: User[];

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;
}
