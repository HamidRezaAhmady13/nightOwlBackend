import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 20)
  @Transform(({ value }) => value.trim())
  username: string;

  @IsEmail()
  @Transform(({ value }) => value.trim())
  email: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,100}$/, {
    message:
      'Password must be 8–100 characters and include letters and numbers',
  })
  password: string;

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
  @Length(0, 50)
  website?: string;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => v.trim()) : [],
  )
  interests?: string[];

  @IsOptional()
  @IsString()
  provider?: 'local' | 'google';
}
