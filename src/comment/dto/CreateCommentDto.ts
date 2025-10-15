import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
