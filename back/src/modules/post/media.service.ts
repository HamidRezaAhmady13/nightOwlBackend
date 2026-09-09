import { LineLogger } from '@/common/utils/lineLogger';
import { toUrlPath } from '@/common/utils/toUrlPth';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { Media } from './entity/media.entity';
import { Post } from './entity/posts.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async savePostMedia(
    postId: string,
    userId: string,
    file: Express.Multer.File,
    manager?: EntityManager,
  ): Promise<Media> {
    const repo = manager ? manager.getRepository(Media) : this.mediaRepository;

    const finalPath = this.buildFinalPath(file.originalname, userId, postId);
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    fs.renameSync(file.path, finalPath);

    const mimeType = file.mimetype;
    const type = mimeType.startsWith('image/')
      ? 'image'
      : mimeType.startsWith('video/')
        ? 'video'
        : 'file';

    const media = repo.create({
      type,
      url: toUrlPath(finalPath),
      owner: { id: userId } as User,
      post: { id: postId } as Post,
    });

    return repo.save(media);
  }

  async replacePostMedia(
    post: Post,
    newFile: Express.Multer.File,
    manager?: EntityManager,
  ): Promise<Media> {
    const existingMedia = post.media ?? [];

    if (existingMedia.length) {
      await this.removeMediaBatch(
        existingMedia.map((m) => m.id),
        manager,
      );
    }

    return this.savePostMedia(post.id, post.owner.id, newFile, manager);
  }

  async deletePostMedia(post: Post, manager?: EntityManager): Promise<void> {
    const existingMedia = post.media ?? [];

    if (existingMedia.length) {
      await this.removeMediaBatch(
        existingMedia.map((m) => m.id),
        manager,
      );
    }

    try {
      const postDir = path.join(
        process.cwd(),
        'uploads',
        `user-${post.owner.id}`,
        `post-${post.id}`,
      );
      fs.rmSync(postDir, { recursive: true, force: true });
    } catch (err) {
      new LineLogger().warn(`Failed to remove post directory ${err}`);
    }
  }

  async saveMediaRow(data: Partial<Media>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Media) : this.mediaRepository;
    return repo.save(repo.create(data));
  }

  async saveMediaBatch(items: Partial<Media>[], manager?: EntityManager) {
    if (!items?.length) return [];
    const repo = manager ? manager.getRepository(Media) : this.mediaRepository;
    return repo.save(items.map((it) => repo.create(it)));
  }

  async removeMediaBatch(mediaIds: string[], manager?: EntityManager) {
    if (!mediaIds?.length) return;
    const repo = manager ? manager.getRepository(Media) : this.mediaRepository;
    const rows = await repo.findByIds(mediaIds);
    await repo.delete(mediaIds);
    const rootDir = process.cwd();
    for (const r of rows) {
      if (!r.url) continue;
      try {
        const relativePath = r.url.replace('/uploads/', '');
        const filePath = path.join(rootDir, 'uploads', relativePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        new LineLogger().warn(
          `Failed to unlink media file r.url :${r.url} err: ${err}`,
        );
      }
    }
  }

  buildFinalPath(origName: string, userId: string, postId: string) {
    const safeName = origName
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '');
    const timestamp = Date.now();
    const ext = path.extname(origName).toLowerCase();
    return path.join(
      process.cwd(),
      'uploads',
      `user-${userId}`,
      `post-${postId}`,
      'original',
      `${safeName}-original-${timestamp}${ext}`,
    );
  }
}
