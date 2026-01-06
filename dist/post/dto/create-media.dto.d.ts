import { MediaType } from 'src/common/enums/media-type.enum';
export declare class CreateMediaDto {
    readonly type: MediaType;
    readonly postId?: string;
}
