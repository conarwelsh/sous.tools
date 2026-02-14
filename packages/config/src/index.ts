import {
  configSchema,
  brandingConfigSchema,
  type Config,
  type BrandingConfig,
} from "./schema.js";
import { SecretManager } from "./secrets.js";

/**
 * Singleton secrets manager instance
 */
export const secrets = new SecretManager();

export { SecretManager, configSchema, brandingConfigSchema, type BrandingConfig };

/**
 * Normalizes environment name synchronously.
 * Strictly uses process.env to avoid Node.js built-in dependencies.
 */
function getEnvSync(): "development" | "staging" | "production" | "test" {
  const env = (typeof process !== 'undefined' ? (process.env.NODE_ENV || process.env.MODE) : "development") || "development";
  if (env === "prod") return "production";
  if (env === "stage") return "staging";
  if (env === "dev") return "development";
  return env as any;
}

/**
 * Ensures a string has a protocol synchronously
 */
function ensureProtocol(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url === "undefined" || url === "null") return undefined;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.startsWith("localhost") || url.startsWith("127.0.0.1") || url.startsWith("172.") || url.startsWith("192.") || url.startsWith("10.")) {
      return `http://${url}`;
    }
    return `https://${url}`;
  }
  return url;
}

/**
 * Synchronously builds the config from process.env.
 * No Node.js built-in dependencies here.
 */
function buildConfig(): Config {
  const envVars = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string>;
  const env = getEnvSync();

  const rawConfig = {
    env,
    api: {
      port: Number(envVars.PORT_API || 4000),
      url: ensureProtocol(envVars.API_URL || envVars.NEXT_PUBLIC_API_URL),
    },
    web: {
      port: Number(envVars.PORT_WEB || 3000),
      url: ensureProtocol(envVars.WEB_URL || envVars.NEXT_PUBLIC_WEB_URL),
    },
    docs: {
      port: Number(envVars.PORT_DOCS || 3001),
      url: ensureProtocol(envVars.DOCS_URL || envVars.NEXT_PUBLIC_DOCS_URL),
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
        url: envVars.SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: envVars.SUPABASE_ANON_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
      level: envVars.LOG_LEVEL || (env === "development" ? "debug" : "info"),
      json: envVars.SOUS_JSON_LOGS === "true",
      logtailToken: envVars.LOGTAIL_SOURCE_TOKEN,
      hyperdxApiKey: envVars.HYPERDX_API_KEY,
    },
    features: {
      enableRegistration: envVars.ENABLE_REGISTRATION !== "false",
      appVersion: envVars.NEXT_PUBLIC_APP_VERSION || envVars.APP_VERSION || "0.1.0",
      appEnv: envVars.APP_ENV || env,
    },
    square: {
      accessToken: envVars.SQUARE_ACCESS_TOKEN,
      applicationId: envVars.SQUARE_APPLICATION_ID,
      clientSecret: envVars.SQUARE_CLIENT_SECRET,
      redirectUri: envVars.SQUARE_REDIRECT_URI,
      merchantId: envVars.SQUARE_MERCHANT_ID,
      endpoint: envVars.SQUARE_ENDPOINT,
      environment: envVars.SQUARE_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
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
      token: envVars.GITHUB_TOKEN,
      repo: envVars.GITHUB_REPO || 'sous-tools/sous.tools',
    },
    support: {
      email: envVars.SUPPORT_EMAIL || 'support@sous.tools',
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
    stripe: {
      secretKey: envVars.STRIPE_SECRET_KEY,
      publishableKey: envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || envVars.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
    },
    infisical: {
      projectId: envVars.INFISICAL_PROJECT_ID,
      clientId: envVars.INFISICAL_CLIENT_ID,
      clientSecret: envVars.INFISICAL_CLIENT_SECRET,
    },
  };

  const result = configSchema.safeParse(rawConfig);
  if (!result.success) {
    // If we're not in a CI/Build environment, we should be strict
    const isStrict = envVars.NODE_ENV === "production" && 
                     envVars.SKIP_CONFIG_VALIDATION !== "true" &&
                     envVars.CI !== "true";
    
    if (isStrict) {
      console.error("❌ [@sous/config] Invalid Configuration:", JSON.stringify(result.error.format(), null, 2));
      throw new Error("Invalid production configuration");
    }
    return rawConfig as any;
  }

  return result.data;
}

/**
 * Synchronous configuration object.
 * Strictly populated from process.env.
 * Secrets MUST be injected by the CLI or environment before this is accessed.
 */
export const config: Config = buildConfig();

// Legacy aliases
export const server = config;
export const client = config;
export const localConfig = config;
