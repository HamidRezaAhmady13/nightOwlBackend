import { User } from 'src/user/entity/user.entity';
import { Message } from './message.entity';
export declare class ChatRoom {
    id: string;
    name: string;
    participants: User[];
    messages: Message[];
    createdAt: Date;
}
