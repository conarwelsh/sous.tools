import { Injectable } from '@nestjs/common';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { logger } from '@sous/logger';

export interface CliConfig {
  currentOrgId?: string;
  token?: string;
  email?: string;
}

@Injectable()
export class CliConfigService {
  private readonly configDir = join(homedir(), '.sous');
  private readonly configPath = join(this.configDir, 'config.json');

  async getConfig(): Promise<CliConfig> {
    try {
      const data = await readFile(this.configPath, 'utf8');
      return JSON.parse(data) as CliConfig;
    } catch {
      return {};
    }
  }

  async setConfig(config: Partial<CliConfig>): Promise<void> {
    try {
      const current = await this.getConfig();
      const updated = { ...current, ...config };

      await mkdir(this.configDir, { recursive: true });
      await writeFile(this.configPath, JSON.stringify(updated, null, 2));
    } catch (error: any) {
      logger.error(`Failed to save CLI config: ${error.message}`);
    }
  }

  async clearConfig(): Promise<void> {
    try {
      await writeFile(this.configPath, JSON.stringify({}, null, 2));
    } catch (error: any) {
      logger.error(`Failed to clear CLI config: ${error.message}`);
    }
  }
}
