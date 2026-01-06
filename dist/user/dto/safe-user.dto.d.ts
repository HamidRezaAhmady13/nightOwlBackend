type MiniUser = {
    id: string;
    username: string;
    avatarUrl?: string;
};
export declare class SafeUserDto {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    bio?: string;
    location?: string;
    website?: string;
    following?: MiniUser[];
    settings: {
        notifications: boolean;
        theme: 'light' | 'dark';
        language: string | null;
    };
}
export {};
