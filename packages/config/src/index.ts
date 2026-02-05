import { config as loadDotenv } from 'dotenv';
import { InfisicalSDK } from '@infisical/sdk';
import { configSchema, type Config, brandingConfigSchema, type BrandingConfig } from './schema.js';
import { logger } from '@sous/logger';

loadDotenv();

export function getLocalConfig(): Config {
  const env = process.env.NODE_ENV || 'development';
  const mergedConfig = {
    env,
    api: {
      port: process.env.API_PORT || 4000,
      url: process.env.API_URL,
    },
    web: {
      port: process.env.WEB_PORT || 3000,
      url: process.env.WEB_URL,
    },
    docs: {
      port: process.env.DOCS_PORT || 3001,
      url: process.env.DOCS_URL,
    },
    native: {
      port: process.env.NATIVE_PORT || 1421,
    },
    headless: {
      port: process.env.HEADLESS_PORT || 1422,
    },
    kds: {
      port: process.env.KDS_PORT || 1423,
    },
    pos: {
      port: process.env.POS_PORT || 1424,
    },
    db: {
      url: process.env.DATABASE_URL,
    },
    redis: {
      url: process.env.REDIS_URL,
    },
    iam: {
      jwtSecret: process.env.JWT_SECRET || 'sous-secret-key',
    },
    storage: {
      supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        bucket: process.env.SUPABASE_BUCKET || 'media',
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
    },
  };

  const parsed = configSchema.safeParse(mergedConfig);
  if (!parsed.success) {
    return mergedConfig as any;
  }
  return parsed.data;
}

export const localConfig = getLocalConfig();

export async function getConfig(envOverride?: string): Promise<Config> {
  let remoteConfig = {};
  const env = envOverride || process.env.NODE_ENV || 'development';
  const infisicalEnv = env === 'development' ? 'dev' : env === 'staging' ? 'staging' : 'prod';

  if (process.env.INFISICAL_CLIENT_ID && process.env.INFISICAL_CLIENT_SECRET && process.env.INFISICAL_PROJECT_ID) {
    try {
      const client = new InfisicalSDK();
      
      await client.auth().universalAuth.login({
        clientId: process.env.INFISICAL_CLIENT_ID,
        clientSecret: process.env.INFISICAL_CLIENT_SECRET,
      });
      
      const response = await client.secrets().listSecrets({
        environment: infisicalEnv,
        projectId: process.env.INFISICAL_PROJECT_ID,
      });

      remoteConfig = response.secrets.reduce((acc, secret) => ({
        ...acc,
        [secret.secretKey]: secret.secretValue,
      }), {});
    } catch (error) {
      logger.warn(`Failed to load secrets from Infisical for ${env}`, error as any);
    }
  }

  const mergedConfig = {
    env,
    api: {
      port: process.env.API_PORT || 4000,
      url: process.env.API_URL,
    },
    web: {
      port: process.env.WEB_PORT || 3000,
      url: process.env.WEB_URL,
    },
    docs: {
      port: process.env.DOCS_PORT || 3001,
      url: process.env.DOCS_URL,
    },
    native: {
      port: process.env.NATIVE_PORT || 1421,
    },
    headless: {
      port: process.env.HEADLESS_PORT || 1422,
    },
    kds: {
      port: process.env.KDS_PORT || 1423,
    },
    pos: {
      port: process.env.POS_PORT || 1424,
    },
    db: {
      url: process.env.DATABASE_URL,
    },
    redis: {
      url: process.env.REDIS_URL,
    },
    iam: {
      jwtSecret: process.env.JWT_SECRET || 'sous-secret-key',
    },
    storage: {
      supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        bucket: process.env.SUPABASE_BUCKET || 'media',
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
    },
    ...remoteConfig,
  };

  const parsed = configSchema.safeParse(mergedConfig);

  if (!parsed.success) {
    logger.error(`❌ Invalid configuration for ${env}: ${JSON.stringify(parsed.error.format())}`);
    process.exit(1);
  }

  return Object.freeze(parsed.data);
}

export const configPromise = getConfig();

export { configSchema, brandingConfigSchema, type Config, type BrandingConfig };
