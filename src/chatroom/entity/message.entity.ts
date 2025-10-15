import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ChatRoom } from './chatroom.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => ChatRoom, (room) => room.messages)
  room: ChatRoom;

  @CreateDateColumn()
  timestamp: Date;
}
