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
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsUrl({ require_protocol: false })
  avatarUrl?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @Length(0, 160)
  bio?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @Length(0, 100)
  location?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() === '') return null; // <-- return null, not undefined
    return value;
  })
  @IsUrl({ require_protocol: false })
  website?: string;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => v.trim()) : [],
  )
  interests?: string[];
}
