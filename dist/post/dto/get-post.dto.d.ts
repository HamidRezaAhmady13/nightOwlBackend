declare class MediaDto {
    id: string;
    type: 'image' | 'video' | 'file';
    url: string;
    quality?: string;
}
declare class OwnerDto {
    id: string;
    username: string;
    avatarUrl?: string;
}
export declare class GetPostDto {
    readonly id: string;
    readonly content?: string;
    readonly createdAt?: Date;
    readonly media?: MediaDto[];
    readonly owner: OwnerDto;
    readonly likedBy?: number;
    readonly comments?: number;
}
export {};
