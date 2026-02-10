import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { DatabaseService } from '../../core/database/database.service.js';
import { media } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class MediaService {
  constructor(private readonly dbService: DatabaseService) {}

  async getMedia(organizationId: string) {
    return this.dbService.db
      .select()
      .from(media)
      .where(eq(media.organizationId, organizationId));
  }

  async processImage(
    buffer: Buffer,
    options: {
      grayscale?: boolean;
      width?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {},
  ) {
    let pipeline = sharp(buffer);

    if (options.grayscale) {
      pipeline = pipeline.grayscale();
    }

    if (options.width) {
      pipeline = pipeline.resize({ width: options.width });
    }

    const format = options.format || 'webp';
    const quality = options.quality || 80;

    const optimizedBuffer = await pipeline
      .toFormat(format, { quality })
      .toBuffer();

    const metadata = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      info: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: optimizedBuffer.length,
      },
    };
  }

  async saveMediaRecord(data: typeof media.$inferInsert) {
    const result = await this.dbService.db
      .insert(media)
      .values(data)
      .returning();

    return result[0];
  }
}
