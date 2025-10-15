import { ArrayNotEmpty, IsArray, IsString, IsUUID } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  participantIds: string[];
}
