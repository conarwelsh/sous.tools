import { config as loadDotenv } from 'dotenv';
import { InfisicalSDK } from '@infisical/sdk';
import { configSchema, type Config } from './schema';

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
  };

  const parsed = configSchema.safeParse(mergedConfig);
  if (!parsed.success) {
    // During local startup, we might be missing some things, so we passthrough or use defaults
    return mergedConfig as any;
  }
  return parsed.data;
}

export const localConfig = getLocalConfig();

export async function getConfig(envOverride?: string): Promise<Config> {
  let remoteConfig = {};
  const env = envOverride || process.env.NODE_ENV || 'development';
  const infisicalEnv = env === 'development' ? 'dev' : env === 'staging' ? 'staging' : 'prod';

  // Optional Infisical Integration
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
      console.warn(`Failed to load secrets from Infisical for ${env}, falling back to process.env`, error);
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
    ...remoteConfig,
  };

  const parsed = configSchema.safeParse(mergedConfig);

  if (!parsed.success) {
    console.error(`❌ Invalid configuration for ${env}:`, parsed.error.format());
    process.exit(1);
  }

  return Object.freeze(parsed.data);
}

// Top-level await is handled by the consumer or an async initializer
export const configPromise = getConfig();

// For synchronous access where we can't await, we export the schema for manual parsing
export { configSchema };