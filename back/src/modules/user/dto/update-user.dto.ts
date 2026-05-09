import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 20)
  @Transform(({ value }) => value.trim())
  username?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value.trim())
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 100)
  @Transform(({ value }) => value.trim())
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: 'Password must contain letters and numbers',
  })
  password?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @Length(0, 160)
  bio?: string;

  @IsOptional()
  @Length(0, 100)
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => v.trim()) : [],
  )
  interests?: string[];
}
