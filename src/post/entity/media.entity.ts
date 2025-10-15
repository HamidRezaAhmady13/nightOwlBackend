import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Post } from './posts.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'image' | 'video' | 'file';

  @Column()
  url: string;

  @ManyToOne(() => User, (user) => user.media)
  owner: User;

  @ManyToOne(() => Post, (post) => post.media, { nullable: true })
  post: Post;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ default: false })
  isThumbnail: boolean;

  @Column({ nullable: true })
  quality?: string;
}
