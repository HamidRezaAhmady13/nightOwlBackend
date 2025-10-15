// src/features/storage/storage.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  /** Deletes a file at the given relative path (e.g. '/uploads/avatars/xyz.png') */
  async delete(filePath: string): Promise<void> {
    try {
      // Adjust baseDir if your files live elsewhere
      const fullPath = join(process.cwd(), filePath.replace(/^\//, ''));
      await unlink(fullPath);
    } catch (err) {
      this.logger.warn(`Failed to delete file ${filePath}: ${err.message}`);
      // Decide: swallow error (already gone?) or rethrow
    }
  }
}
