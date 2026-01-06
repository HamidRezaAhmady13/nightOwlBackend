export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
    website?: string;
    interests?: string[];
    provider?: 'local' | 'google';
}
