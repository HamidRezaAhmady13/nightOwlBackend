import { Post } from 'src/modules/post/entity/posts.entity';
import { User } from 'src/modules/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
