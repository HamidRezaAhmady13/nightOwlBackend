import { User } from 'src/user/entity/user.entity';
import { ChatRoom } from './chatroom.entity';
export declare class Message {
    id: string;
    content: string;
    sender: User;
    room: ChatRoom;
    timestamp: Date;
}
