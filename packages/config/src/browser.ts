import {
  configSchema,
  brandingConfigSchema,
  type Config,
  type BrandingConfig,
} from "./schema.js";
import { SecretManager } from "./secrets.js";

/**
 * Singleton secrets manager instance (Stub in browser)
 */
export const secrets = new SecretManager();

export {
  SecretManager,
  configSchema,
  brandingConfigSchema,
  type BrandingConfig,
};

export function parseBootstrapEnv(): any {
  throw new Error("parseBootstrapEnv is only available on the server");
}

/**
 * Synchronously builds the config from process.env (Standard in browser)
 */
function buildConfig(): Config {
  // In the browser, process.env is usually pre-populated by bundlers (e.g. Next.js)
  const envVars = (typeof process !== "undefined" ? process.env : {}) as Record<
    string,
    string
  >;
  const env = envVars.NODE_ENV || "development";

  const rawConfig = {
    env,
    api: {
      port: Number(envVars.PORT_API || 4000),
      url: envVars.NEXT_PUBLIC_API_URL || envVars.API_URL,
    },
    web: {
      port: Number(envVars.PORT_WEB || 3000),
      url: envVars.NEXT_PUBLIC_WEB_URL || envVars.WEB_URL,
    },
    docs: {
      port: Number(envVars.PORT_DOCS || 3001),
      url: envVars.NEXT_PUBLIC_DOCS_URL || envVars.DOCS_URL,
    },
    db: {
      url: envVars.DATABASE_URL,
      readerUrl: envVars.DATABASE_URL_READ || envVars.DATABASE_URL,
    },
    redis: {
      url: envVars.REDIS_URL,
    },
    iam: {
      jwtSecret: envVars.JWT_SECRET || envVars.SESSION_SECRET,
    },
    storage: {
      supabase: {
        url: envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL,
        anonKey:
          envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY,
        serviceRoleKey: envVars.SUPABASE_SERVICE_ROLE_KEY,
        bucket: envVars.SUPABASE_BUCKET || "media",
      },
      cloudinary: {
        cloudName: envVars.CLOUDINARY_CLOUD_NAME,
        apiKey: envVars.CLOUDINARY_API_KEY,
        apiSecret: envVars.CLOUDINARY_API_SECRET,
      },
    },
    logger: {
      level: envVars.LOG_LEVEL || "info",
      json: envVars.SOUS_JSON_LOGS === "true",
      hyperdxApiKey: envVars.HYPERDX_API_KEY,
    },
    features: {
      enableRegistration: envVars.ENABLE_REGISTRATION !== "false",
      appVersion:
        envVars.NEXT_PUBLIC_APP_VERSION || envVars.APP_VERSION || "0.1.0",
      appEnv: envVars.APP_ENV || env,
    },
    square: {
      accessToken: envVars.SQUARE_ACCESS_TOKEN,
      applicationId: envVars.SQUARE_APPLICATION_ID,
      clientSecret: envVars.SQUARE_CLIENT_SECRET,
      redirectUri: envVars.SQUARE_REDIRECT_URI,
      merchantId: envVars.SQUARE_MERCHANT_ID,
      endpoint: envVars.SQUARE_ENDPOINT,
      environment:
        envVars.SQUARE_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
    },
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      redirectUri: envVars.GOOGLE_REDIRECT_URI,
    },
    github: {
      clientId: envVars.GITHUB_CLIENT_ID,
      clientSecret: envVars.GITHUB_CLIENT_SECRET,
      redirectUri: envVars.GITHUB_REDIRECT_URI,
    },
    facebook: {
      clientId: envVars.FACEBOOK_CLIENT_ID,
      clientSecret: envVars.FACEBOOK_CLIENT_SECRET,
      redirectUri: envVars.FACEBOOK_REDIRECT_URI,
    },
    ai: {
      googleGenerativeAiApiKey: envVars.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    resend: {
      apiKey: envVars.RESEND_API_KEY,
      from: envVars.RESEND_FROM_EMAIL || "Sous <notifications@sous.tools>",
    },
  };

  return rawConfig as any;
}

export const config: Config = buildConfig();
export const server = config;
export const client = config;
export const localConfig = config;
