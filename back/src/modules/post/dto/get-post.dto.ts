import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

class MediaDto {
  @IsString()
  id: string;

  @IsString()
  type: 'image' | 'video' | 'file';

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  quality?: string;
}

class OwnerDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class GetPostDto {
  @IsString()
  readonly id: string;

  @IsOptional()
  @IsString()
  readonly content?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly createdAt?: Date;

  @IsOptional()
  @IsArray()
  @Type(() => MediaDto)
  readonly media?: MediaDto[];

  @IsOptional()
  @IsObject()
  @Type(() => OwnerDto)
  readonly owner: OwnerDto;

  @IsOptional()
  @IsNumber()
  readonly likedBy?: number;

  @IsOptional()
  @IsNumber()
  readonly comments?: number;
}
