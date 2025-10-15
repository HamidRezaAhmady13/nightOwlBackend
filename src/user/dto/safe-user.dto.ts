import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from '../entity/user.entity';

const DEFAULT_AVATAR = './uploads/default-avatar.png';
const BASE = process.env.API_URL?.replace(/\/$/, '') || '';
@Exclude()
export class SafeUserDto {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() email: string;
  // @Expose() avatarUrl?: string;
  @Expose()
  @Transform(({ obj }) => {
    const raw = obj.avatarUrl;
    if (!raw) {
      return DEFAULT_AVATAR;
    }
    if (raw.startsWith('http')) {
      return raw;
    }
    return `${BASE}${raw}`;
  })
  avatarUrl: string;

  @Expose() bio?: string;
  @Expose() location?: string;
  @Expose() website?: string;
  @Expose() following?: User[];
}
