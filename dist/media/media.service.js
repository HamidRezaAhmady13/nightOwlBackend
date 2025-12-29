"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const media_entity_1 = require("../post/entity/media.entity");
const typeorm_2 = require("typeorm");
const util_1 = require("util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
let MediaService = class MediaService {
    mediaRepository;
    rootDir = '/var/storage/uploads';
    constructor(mediaRepository) {
        this.mediaRepository = mediaRepository;
    }
    async processVideo(inputPath, userId, postId, originalName) {
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
        if (resolutions.length === 0) {
            resolutions.push({
                name: `${inputHeight}p`,
                scale: `-1:${inputHeight}`,
                bandwidth: 400000,
            });
        }
        const mp4Variants = await this.generateMp4Variants(inputPath, resolutions, folders.mp4, originalName, timestamp);
        const thumbnails = await this.generateThumbnails(mp4Variants.at(-1), folders.thumbnails, originalName, timestamp, 30, 160, 20);
        console.log(`🚀 Starting HLS generation for ${resolutions.length} resolutions`);
        const hlsFolder = await this.generateMultiQualityHLS(inputPath, resolutions, folders.hls, originalName, timestamp);
        return {
            original: inputPath,
            mp4Variants,
            thumbnails,
            hlsFolder,
        };
    }
    async getVideoHeight(inputPath) {
        const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "${inputPath}"`;
        const { stdout } = await execPromise(cmd);
        return parseInt(stdout.trim(), 10);
    }
    getTargetResolutions(height) {
        const base = [
            { name: '1080p', scale: '1920:1080', bandwidth: 5000000 },
            { name: '720p', scale: '1280:720', bandwidth: 2800000 },
            { name: '480p', scale: '854:480', bandwidth: 1400000 },
            { name: '360p', scale: '640:360', bandwidth: 800000 },
        ];
        return base.filter((r) => parseInt(r.scale.split(':')[1], 10) <= height);
    }
    async generateMp4Variants(inputPath, resolutions, outputDir, originalName, timestamp) {
        const variants = [];
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
    async removeMediaBatch(mediaIds, manager) {
        if (!mediaIds?.length)
            return;
        const repo = manager ? manager.getRepository(media_entity_1.Media) : this.mediaRepository;
        const rows = await repo.findByIds(mediaIds);
        await repo.delete(mediaIds);
        for (const r of rows) {
            if (!r.url)
                continue;
            try {
                const relativePath = r.url.replace('/uploads/', '');
                const filePath = path.join(this.rootDir, relativePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            catch (err) {
                console.warn('Failed to unlink media file', r.url, err);
            }
        }
    }
    async generateThumbnails(videoPath, outputDir, originalName, timestamp, intervalSec = 30, width = 160, quality = 20) {
        if (!fs.existsSync(outputDir))
            fs.mkdirSync(outputDir, { recursive: true });
        const safe = originalName
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-_]/g, '');
        const probe = `ffprobe -v error -select_streams v:0 -show_entries format=duration -of csv=p=0 "${videoPath}"`;
        const { stdout } = await execPromise(probe);
        const duration = Math.floor(parseFloat(stdout.trim()));
        const results = [];
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
    async generateMultiQualityHLS(inputPath, resolutions, outputDir, originalName, timestamp) {
        const masterPlaylist = path.join(outputDir, 'master.m3u8');
        console.log(`✅ HLS master playlist will be created at: ${masterPlaylist}`);
        const lines = ['#EXTM3U'];
        for (const res of resolutions) {
            const resDir = path.join(outputDir, res.name);
            this.ensureDir(resDir);
            console.log(`🎬 Generating HLS for ${res.name}`);
            const playlist = path.join(resDir, 'playlist.m3u8');
            const segments = path.join(resDir, `${originalName}-${res.name}-${timestamp}_%03d.ts`);
            const cmd = `ffmpeg -i "${inputPath}" -vf "scale=${res.scale}" -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${segments}" "${playlist}"`;
            try {
                await execPromise(cmd);
            }
            catch (err) {
                console.error(`❌ Failed to generate HLS for ${res.name}:`, err);
            }
            lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${res.bandwidth},RESOLUTION=${res.scale}`);
            lines.push(`${res.name}/playlist.m3u8`);
        }
        fs.writeFileSync(masterPlaylist, lines.join('\n'), 'utf8');
        return outputDir;
    }
    ensureDir(dir) {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MediaService);
//# sourceMappingURL=media.service.js.map