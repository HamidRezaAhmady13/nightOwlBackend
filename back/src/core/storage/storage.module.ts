import { StorageService } from '@/core/storage/storage.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
