import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessedVideo } from 'src/common/interfaces/ProcessedVideo';
import { Media } from 'src/post/entity/media.entity';
import { EntityManager, Repository } from 'typeorm';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class MediaService {
  private readonly rootDir = path.join(process.cwd(), 'uploads');
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}
  async processVideo(
    inputPath: string,
    userId: string,
    postId: string,
    originalName: string,
  ): Promise<ProcessedVideo> {
    const timestamp = Date.now();
    const baseDir = path.join(this.rootDir, `user-${userId}`, `post-${postId}`);

    const folders = {
      original: path.join(baseDir, 'original'),
      thumbnails: path.join(baseDir, 'thumbnails'),
      hls: path.join(baseDir, 'hls'),
      mp4: path.join(baseDir, 'mp4'),
    };

    Object.values(folders).forEach(this.ensureDir);

    const inputHeight = await this.getVideoHeight(inputPath);
    let resolutions = this.getTargetResolutions(inputHeight);

    // Always ensure at least one resolution
    if (resolutions.length === 0) {
      resolutions.push({
        name: `${inputHeight}p`,
        scale: `-1:${inputHeight}`,
        bandwidth: 400000,
      });
    }

    const mp4Variants = await this.generateMp4Variants(
      inputPath,
      resolutions,
      folders.mp4,
      originalName,
      timestamp,
    );

    // Generate all thumbnails (array)
    const thumbnails = await this.generateThumbnails(
      mp4Variants.at(-1)!,
      folders.thumbnails,
      originalName,
      timestamp,
      30, // intervalSec
      160, // width
      20, // quality
    );

    console.log(
      `🚀 Starting HLS generation for ${resolutions.length} resolutions`,
    );
    const hlsFolder = await this.generateMultiQualityHLS(
      inputPath, // use original file for scaling
      resolutions,
      folders.hls,
      originalName,
      timestamp,
    );

    return {
      original: inputPath,
      mp4Variants,
      thumbnails, // always plural
      hlsFolder,
    };
  }

  private async getVideoHeight(inputPath: string): Promise<number> {
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "${inputPath}"`;
    const { stdout } = await execPromise(cmd);
    return parseInt(stdout.trim(), 10);
  }

  private getTargetResolutions(height: number) {
    const base = [
      { name: '1080p', scale: '1920:1080', bandwidth: 5000000 },
      { name: '720p', scale: '1280:720', bandwidth: 2800000 },
      { name: '480p', scale: '854:480', bandwidth: 1400000 },
      { name: '360p', scale: '640:360', bandwidth: 800000 },
    ];
    return base.filter((r) => parseInt(r.scale.split(':')[1], 10) <= height);
  }

  private async generateMp4Variants(
    inputPath: string,
    resolutions: { name: string; scale: string }[],
    outputDir: string,
    originalName: string,
    timestamp: number,
  ): Promise<string[]> {
    const variants: string[] = [];
    const safeName = originalName
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '');

    for (const res of resolutions) {
      const filename = `${safeName}-${res.name}-${timestamp}.mp4`;
      const outputPath = path.join(outputDir, filename);
      const cmd = `ffmpeg -i "${inputPath}" -vf "scale=${res.scale}" -c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`;
      await execPromise(cmd);
      variants.push(outputPath);
    }
    return variants;
  }
  async removeMediaBatch(
    mediaIds: string[],
    manager?: EntityManager,
  ): Promise<void> {
    if (!mediaIds?.length) return;

    const repo = manager ? manager.getRepository(Media) : this.mediaRepository;

    // fetch rows first so we know file paths to delete
    const rows = await repo.findByIds(mediaIds);

    // delete DB rows
    await repo.delete(mediaIds);

    // try to unlink files (best-effort, do not throw when file missing)
    for (const r of rows) {
      if (!r.url) continue;
      try {
        // r.url may be stored as a relative path like '/uploads/...'
        const filePath = r.url.startsWith('/')
          ? path.join(process.cwd(), r.url)
          : path.join(process.cwd(), r.url);
        // use unlinkSync for simplicity; or await fs.promises.unlink(filePath)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        // log and continue; do not fail the transaction because of FS cleanup
        console.warn('Failed to unlink media file', r.url, err);
      }
    }
  }

  private async generateThumbnails(
    videoPath: string,
    outputDir: string,
    originalName: string,
    timestamp: number,
    intervalSec = 30,
    width = 160,
    quality = 20,
  ): Promise<string[]> {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const safe = originalName
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '');

    const probe = `ffprobe -v error -select_streams v:0 -show_entries format=duration -of csv=p=0 "${videoPath}"`;
    const { stdout } = await execPromise(probe);
    const duration = Math.floor(parseFloat(stdout.trim()));

    const results: string[] = [];
    for (let offset = 0; offset < duration; offset += intervalSec) {
      const filename = `${safe}-thumbnail-${offset}s.webp`;
      const outputPath = path.join(outputDir, filename);
      const cmd = [
        `ffmpeg`,
        `-ss ${offset}`,
        `-i "${videoPath}"`,
        `-vframes 1`,
        `-vf "scale=${width}:-1"`,
        `-c:v libwebp`,
        `-q:v ${quality}`,
        `"${outputPath}"`,
      ].join(' ');
      await execPromise(cmd);
      results.push(outputPath);
    }
    return results;
  }

  private async generateMultiQualityHLS(
    inputPath: string,
    resolutions: { name: string; scale: string; bandwidth: number }[],
    outputDir: string,
    originalName: string,
    timestamp: number,
  ): Promise<string> {
    const masterPlaylist = path.join(outputDir, 'master.m3u8');
    console.log(`✅ HLS master playlist will be created at: ${masterPlaylist}`);
    const lines = ['#EXTM3U'];

    for (const res of resolutions) {
      const resDir = path.join(outputDir, res.name);
      this.ensureDir(resDir);
      console.log(`🎬 Generating HLS for ${res.name}`);

      const playlist = path.join(resDir, 'playlist.m3u8');
      const segments = path.join(
        resDir,
        `${originalName}-${res.name}-${timestamp}_%03d.ts`,
      );

      const cmd = `ffmpeg -i "${inputPath}" -vf "scale=${res.scale}" -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${segments}" "${playlist}"`;
      try {
        await execPromise(cmd);
      } catch (err) {
        console.error(`❌ Failed to generate HLS for ${res.name}:`, err);
      }

      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${res.bandwidth},RESOLUTION=${res.scale}`,
      );
      lines.push(`${res.name}/playlist.m3u8`);
    }

    fs.writeFileSync(masterPlaylist, lines.join('\n'), 'utf8');
    return outputDir;
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}
