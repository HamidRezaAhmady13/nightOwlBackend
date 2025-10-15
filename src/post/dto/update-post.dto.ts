// src/post/dto/update-post.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  replaceMedia?: boolean; // if true and file provided, replace existing media

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  removeMediaIds?: string[]; // list of media ids to remove from the post
}
