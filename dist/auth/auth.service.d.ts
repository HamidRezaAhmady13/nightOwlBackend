import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from 'src/auth/entity/refresh-token.entity';
import { RevocationService } from 'src/auth/revocation.service';
import { LineLogger } from 'src/common/utils/lineLogger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private revocation;
    private readonly dataSource;
    private readonly config;
    private rtRepo;
    constructor(userService: UserService, jwtService: JwtService, revocation: RevocationService, dataSource: DataSource, config: ConfigService, rtRepo: Repository<RefreshToken>);
    logger: LineLogger;
    private createTokens;
    signUp(createUserDto: CreateUserDto): Promise<{
        access_token: string;
        refresh_token: string;
        refreshJti: any;
        ttlMs: number;
    }>;
    signIn(email: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
        refreshJti: any;
        ttlMs: number;
    }>;
    handleProviderLogin(providerUser: any): Promise<{
        access_token: string;
        refresh_token: string;
        refreshJti: any;
        ttlMs: number;
    }>;
    verifyJwt(token: string): Promise<any>;
    generateToken(userId: string | number, email: string): Promise<{
        access_token: string;
    }>;
    refresh(refreshJwt: string): Promise<{
        access_token: string;
        refresh_token: string;
        refreshJti: string;
    }>;
}
