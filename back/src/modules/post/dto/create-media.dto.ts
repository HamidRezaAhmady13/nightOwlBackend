import { MediaType } from '@/common/enums/media-type.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsEnum(MediaType)
  readonly type: MediaType; // 'image' or 'video'

  @IsOptional()
  @IsString()
  readonly postId?: string; // Link to post if needed
}
