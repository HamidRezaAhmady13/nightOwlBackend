import { ProcessedVideo } from 'src/common/interfaces/ProcessedVideo';
import { Media } from 'src/post/entity/media.entity';
import { EntityManager, Repository } from 'typeorm';
export declare class MediaService {
    private readonly mediaRepository;
    private readonly rootDir;
    constructor(mediaRepository: Repository<Media>);
    processVideo(inputPath: string, userId: string, postId: string, originalName: string): Promise<ProcessedVideo>;
    private getVideoHeight;
    private getTargetResolutions;
    private generateMp4Variants;
    removeMediaBatch(mediaIds: string[], manager?: EntityManager): Promise<void>;
    private generateThumbnails;
    private generateMultiQualityHLS;
    private ensureDir;
}
