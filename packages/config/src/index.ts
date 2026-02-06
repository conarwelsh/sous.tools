import { configSchema, type Config, brandingConfigSchema, type BrandingConfig } from './schema.js';
import { logger } from '@sous/logger';
import { config as loadDotenvSync } from 'dotenv';
import * as path from 'path';

const isServer = typeof window === 'undefined';

// Helper to safely access environment variables in both Node and Browser
const getEnv = () => {
  if (isServer) return process.env;
  return (globalThis as any).process?.env || {};
};

export function getLocalConfig(): Config {
  // Load .env synchronously on server to ensure local overrides work for sync getters
  if (isServer) {
    const envPath = path.resolve(process.cwd(), '.env');
    loadDotenvSync({ path: envPath });
  }

  const envVars = getEnv();
  const env = envVars.NODE_ENV || (envVars as any).MODE || 'development';
  
  const mergedConfig = {
    env,
    api: {
      port: envVars.API_PORT || (envVars as any).VITE_API_PORT || 4000,
      url: envVars.API_URL || (envVars as any).VITE_API_URL,
    },
    web: {
      port: envVars.WEB_PORT || (envVars as any).VITE_WEB_PORT || 3000,
      url: envVars.WEB_URL || (envVars as any).VITE_WEB_URL,
    },
    docs: {
      port: envVars.DOCS_PORT || (envVars as any).VITE_DOCS_PORT || 3001,
      url: envVars.DOCS_URL || (envVars as any).VITE_DOCS_URL,
    },
    native: {
      port: envVars.NATIVE_PORT || (envVars as any).VITE_NATIVE_PORT || 1421,
    },
    headless: {
      port: envVars.HEADLESS_PORT || (envVars as any).VITE_HEADLESS_PORT || 1422,
    },
    kds: {
      port: envVars.KDS_PORT || (envVars as any).VITE_KDS_PORT || 1423,
    },
    pos: {
      port: envVars.POS_PORT || (envVars as any).VITE_POS_PORT || 1424,
    },
    db: {
      url: envVars.DATABASE_URL,
    },
    redis: {
      url: envVars.REDIS_URL,
    },
    iam: {
      jwtSecret: envVars.JWT_SECRET || (envVars as any).VITE_JWT_SECRET || 'sous-secret-key',
    },
    storage: {
      supabase: {
        url: envVars.SUPABASE_URL || (envVars as any).VITE_SUPABASE_URL,
        anonKey: envVars.SUPABASE_ANON_KEY || (envVars as any).VITE_SUPABASE_ANON_KEY,
        bucket: envVars.SUPABASE_BUCKET || (envVars as any).VITE_SUPABASE_BUCKET || 'media',
      },
      cloudinary: {
        cloudName: envVars.CLOUDINARY_CLOUD_NAME || (envVars as any).VITE_CLOUDINARY_CLOUD_NAME,
        apiKey: envVars.CLOUDINARY_API_KEY || (envVars as any).VITE_CLOUDINARY_API_KEY,
        apiSecret: envVars.CLOUDINARY_API_SECRET,
      },
    },
  };

  const parsed = configSchema.safeParse(mergedConfig);
  if (!parsed.success) {
    return mergedConfig as any;
  }
  return parsed.data;
}

export function getActiveConfig(): Config {
  return getLocalConfig();
}

export const localConfig = getLocalConfig();

export async function getConfig(envOverride?: string): Promise<Config> {
  const envVars = getEnv();
  const env = envOverride || envVars.NODE_ENV || (envVars as any).MODE || 'development';
  const infisicalEnv = env === 'development' ? 'dev' : env === 'staging' ? 'staging' : 'prod';
  let remoteConfig = {};

  if (isServer && process.env.INFISICAL_CLIENT_ID && process.env.INFISICAL_CLIENT_SECRET && process.env.INFISICAL_PROJECT_ID) {
    try {
      const { InfisicalSDK } = await import('@infisical/sdk');
      const { config: loadDotenv } = await import('dotenv');
      loadDotenv();

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

      // Inject secrets into process.env only if not already set (allow local overrides)
      for (const secret of response.secrets) {
        if (!process.env[secret.secretKey]) {
          process.env[secret.secretKey] = secret.secretValue;
        }
      }

      logger.info(`🔐 Successfully loaded ${response.secrets.length} secrets from Infisical for ${env}`);
    } catch (error) {
      logger.warn(`Failed to load secrets from Infisical for ${env}`, error as any);
    }
  }

  // Re-read env vars in case Infisical injected some
  const updatedEnvVars = getEnv();

  const mergedConfig = {
    env,
    api: {
      port: updatedEnvVars.API_PORT || (updatedEnvVars as any).VITE_API_PORT || 4000,
      url: updatedEnvVars.API_URL || (updatedEnvVars as any).VITE_API_URL,
    },
    web: {
      port: updatedEnvVars.WEB_PORT || (updatedEnvVars as any).VITE_WEB_PORT || 3000,
      url: updatedEnvVars.WEB_URL || (updatedEnvVars as any).VITE_WEB_URL,
    },
    docs: {
      port: updatedEnvVars.DOCS_PORT || (updatedEnvVars as any).VITE_DOCS_PORT || 3001,
      url: updatedEnvVars.DOCS_URL || (updatedEnvVars as any).VITE_DOCS_URL,
    },
    native: {
      port: updatedEnvVars.NATIVE_PORT || (updatedEnvVars as any).VITE_NATIVE_PORT || 1421,
    },
    headless: {
      port: updatedEnvVars.HEADLESS_PORT || (updatedEnvVars as any).VITE_HEADLESS_PORT || 1422,
    },
    kds: {
      port: updatedEnvVars.KDS_PORT || (updatedEnvVars as any).VITE_KDS_PORT || 1423,
    },
    pos: {
      port: updatedEnvVars.POS_PORT || (updatedEnvVars as any).VITE_POS_PORT || 1424,
    },
    db: {
      url: updatedEnvVars.DATABASE_URL,
    },
    redis: {
      url: updatedEnvVars.REDIS_URL,
    },
    iam: {
      jwtSecret: updatedEnvVars.JWT_SECRET || (updatedEnvVars as any).VITE_JWT_SECRET || 'sous-secret-key',
    },
    storage: {
      supabase: {
        url: updatedEnvVars.SUPABASE_URL || (updatedEnvVars as any).VITE_SUPABASE_URL,
        anonKey: updatedEnvVars.SUPABASE_ANON_KEY || (updatedEnvVars as any).VITE_SUPABASE_ANON_KEY,
        bucket: updatedEnvVars.SUPABASE_BUCKET || (updatedEnvVars as any).VITE_SUPABASE_BUCKET || 'media',
      },
      cloudinary: {
        cloudName: updatedEnvVars.CLOUDINARY_CLOUD_NAME || (updatedEnvVars as any).VITE_CLOUDINARY_CLOUD_NAME,
        apiKey: updatedEnvVars.CLOUDINARY_API_KEY || (updatedEnvVars as any).VITE_CLOUDINARY_API_KEY,
        apiSecret: updatedEnvVars.CLOUDINARY_API_SECRET,
      },
    },
    ...remoteConfig,
  };

  const parsed = configSchema.safeParse(mergedConfig);

  if (!parsed.success) {
    logger.error(`❌ Invalid configuration for ${env}: ${JSON.stringify(parsed.error.format())}`);
    if (isServer) process.exit(1);
    return mergedConfig as any;
  }

  return parsed.data;
}

export const configPromise = getConfig();

export { configSchema, brandingConfigSchema, type Config, type BrandingConfig };
