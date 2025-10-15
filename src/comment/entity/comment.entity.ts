import { Post } from 'src/post/entity/posts.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @ManyToOne(() => User, (user) => user.comments, {
    eager: false,
    onDelete: 'CASCADE',
  })
  author: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.childComments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentComment: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parentComment, {
    cascade: true,
  })
  childComments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User)
  @JoinTable()
  likedByUsers: User[];

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  replyCount: number;
}
