import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { localConfig } from '@sous/config';
import { logger } from '@sous/logger';

@Injectable()
export class SupabaseStorageService {
  private client: SupabaseClient | null = null;
  private bucket: string;

  constructor() {
    const config = localConfig.storage?.supabase;
    if (config?.url && config?.anonKey) {
      this.client = createClient(config.url, config.anonKey);
    }
    this.bucket = config?.bucket || 'media';
  }

  async upload(file: Buffer, path: string, mimeType: string) {
    if (!this.client) {
      logger.warn('Supabase storage client not initialized. Skipping upload.');
      return null;
    }

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      logger.error(`Failed to upload file to Supabase: ${error.message}`);
      throw error;
    }

    const { data: publicUrlData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrlData.publicUrl,
    };
  }

  async delete(path: string) {
    if (!this.client) return;

    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      logger.error(`Failed to delete file from Supabase: ${error.message}`);
      throw error;
    }
  }
}
