import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationStatus {
  Pending = 'pending',
  Delivered = 'delivered',
  Error = 'error',
}
// TypeORM simplified
@Entity('notifications')
export class NotificationEntity {
  // @Column({
  //   type: 'enum',
  //   enum: NotificationStatus,
  //   default: NotificationStatus.Pending,
  // })
  // status: NotificationStatus;

  @PrimaryGeneratedColumn('uuid') id: string;
  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'text' })
  smallBody: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  payloadRef: any | null;

  @Column({ type: 'jsonb', nullable: true })
  meta: any | null;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expireAt?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  sourceId?: string | null;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'sourceId' })
  sourceUser: User;
}
