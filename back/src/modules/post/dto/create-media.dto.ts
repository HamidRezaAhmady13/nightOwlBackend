import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MediaType } from 'src/common/enums/media-type.enum';

export class CreateMediaDto {
  @IsEnum(MediaType)
  readonly type: MediaType; // 'image' or 'video'

  @IsOptional()
  @IsString()
  readonly postId?: string; // Link to post if needed
}
