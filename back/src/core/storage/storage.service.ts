// src/features/storage/storage.service.ts
import { LineLogger } from '@/common/utils/lineLogger';
import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new LineLogger();

  async delete(filePath: string): Promise<void> {
    try {
      const fullPath = join(process.cwd(), filePath.replace(/^\//, ''));
      await unlink(fullPath);
    } catch (err) {
      this.logger.warn(
        `Failed to delete file ${filePath}: ${(err as any).message}`,
      );
    }
  }
}
