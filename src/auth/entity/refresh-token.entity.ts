// refresh-token.entity.ts
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn() id: number;

  @Index({ unique: true })
  @Column({ type: 'uuid', nullable: true, default: () => 'gen_random_uuid()' })
  jti?: string;

  @Column({ type: 'uuid', nullable: true, default: () => 'gen_random_uuid()' })
  userId?: string;

  // @Column({ type: 'bigint' }) expiresAt: number;
  @Column({
    type: 'bigint',
    transformer: {
      to: (v: number) => String(v),
      from: (v: string) => Number(v),
    },
  })
  expiresAt: number;

  @Column({ default: false }) revoked: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // RefreshToken entity
  // @Column('uuid', { nullable: true, default: () => 'gen_random_uuid()' })
  // jti?: string;
}
