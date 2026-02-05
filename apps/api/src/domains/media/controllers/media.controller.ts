import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../services/media.service.js';
import { SupabaseStorageService } from '../services/supabase-storage.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { logger } from '@sous/logger';
import { v4 as uuidv4 } from 'uuid';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const orgId = req.user.orgId;
    if (!orgId) {
      throw new BadRequestException('Organization context missing');
    }

    // 1. Process & Optimize (ADR 028: Mandate Grayscale/WebP for Invoices/General)
    // For now, we apply aggressive optimization to all uploads to stay in free tier
    const isImage = file.mimetype.startsWith('image/');
    let buffer = file.buffer;
    let metadata: any = {};

    if (isImage) {
      const optimized = await this.mediaService.processImage(file.buffer, {
        grayscale: true,
        width: 1200, // Reasonable max width for mobile/web
        format: 'webp',
      });
      buffer = optimized.buffer;
      metadata = optimized.info;
    }

    // 2. Upload to Supabase
    const fileExt = isImage ? 'webp' : file.originalname.split('.').pop();
    const fileName = `${orgId}/${uuidv4()}.${fileExt}`;

    const uploadResult = await this.storageService.upload(
      buffer,
      fileName,
      isImage ? 'image/webp' : file.mimetype,
    );

    if (!uploadResult) {
      throw new BadRequestException('Failed to upload file to storage');
    }

    // 3. Save Record to DB
    const mediaRecord = await this.mediaService.saveMediaRecord({
      organizationId: orgId,
      name: file.originalname,
      url: uploadResult.url,
      key: uploadResult.path,
      mimeType: isImage ? 'image/webp' : file.mimetype,
      size: buffer.length,
      width: metadata.width,
      height: metadata.height,
    });

    return mediaRecord;
  }
}
