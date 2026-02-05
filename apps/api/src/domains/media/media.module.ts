import { Module } from '@nestjs/common';
import { MediaService } from './services/media.service.js';
import { SupabaseStorageService } from './services/supabase-storage.service.js';
import { MediaController } from './controllers/media.controller.js';
import { AuthModule } from '../iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  providers: [MediaService, SupabaseStorageService],
  controllers: [MediaController],
  exports: [MediaService, SupabaseStorageService],
})
export class MediaModule {}
