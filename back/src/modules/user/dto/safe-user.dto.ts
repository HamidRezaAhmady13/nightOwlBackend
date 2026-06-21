import { Exclude, Expose, Transform } from 'class-transformer';

const BASE = process.env.API_URL?.replace(/\/$/, '') || '';

type MiniUser = { id: string; username: string; avatarUrl?: string };

@Exclude()
export class SafeUserDto {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() email: string;

  @Expose()
  @Transform(({ obj }) => {
    const raw = obj.avatarUrl;
    if (!raw || raw.includes('default-avatar.png')) return null;
    if (raw.startsWith('http')) return raw;
    return `${BASE}${raw}`;
  })
  avatarUrl: string | null;

  @Expose() bio?: string;
  @Expose() location?: string;
  @Expose() website?: string;
  @Expose()
  @Transform(({ obj }) => {
    const following = obj.following as any[] | undefined;
    if (!Array.isArray(following)) return [];
    return following.map(
      (u): MiniUser => ({
        id: String(u.id),
        username: u.username,

        avatarUrl:
          u.avatarUrl && u.avatarUrl.startsWith('http')
            ? u.avatarUrl
            : u.avatarUrl
              ? `/uploads/${u.avatarUrl}`
              : '/uploads/default-avatar.png',
      }),
    );
  })
  following?: MiniUser[];

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.settings ?? { notifications: false, theme: 'light', language: null },
  )
  settings: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string | null;
  };
}
