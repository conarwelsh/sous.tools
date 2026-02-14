import {
  configSchema,
  brandingConfigSchema,
  type Config,
  type BrandingConfig,
} from "./schema.js";
import { SecretManager } from "./secrets.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as cp from "child_process";

const isServer = typeof window === "undefined";

/**
 * Singleton secrets manager instance
 */
export const secrets = new SecretManager();

export { SecretManager, configSchema, brandingConfigSchema, type BrandingConfig };
export const bootstrapEnvSchema = z.object({
  INFISICAL_PROJECT_ID: z.string().min(1, "INFISICAL_PROJECT_ID is required in .env"),
  INFISICAL_CLIENT_ID: z.string().min(1, "INFISICAL_CLIENT_ID is required in .env"),
  INFISICAL_CLIENT_SECRET: z.string().min(1, "INFISICAL_CLIENT_SECRET is required in .env"),
});

export type BootstrapEnv = z.infer<typeof bootstrapEnvSchema>;

/**
 * Finds project root by looking for pnpm-workspace.yaml synchronously
 */
function findProjectRootSync(): string {
  if (!isServer) return "";
  let current = process.cwd();
  while (current !== "/" && !fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return current;
}

/**
 * Synchronously parses a .env file containing ONLY Infisical credentials
 */
export function parseBootstrapEnv(): BootstrapEnv {
  if (!isServer) {
    throw new Error("parseBootstrapEnv can only be called on the server");
  }

  const root = findProjectRootSync();
  const envPath = path.join(root, ".env");

  if (!fs.existsSync(envPath)) {
    throw new Error(`.env file not found at ${envPath}. It MUST contain INFISICAL_ credentials.`);
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};

  content.split("\n").forEach((line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...values] = trimmed.split("=");
    if (key && values.length > 0) {
      env[key.trim()] = values.join("=").trim().replace(/^["']|["']$/g, "");
    }
  });

  const result = bootstrapEnvSchema.safeParse(env);
  if (!result.success) {
    console.error("❌ [@sous/config] Invalid .env file structure:");
    result.error.errors.forEach(err => console.error(`  - ${err.path.join(".")}: ${err.message}`));
    throw new Error("Invalid .env configuration");
  }

  return result.data;
}

/**
 * Normalizes environment name synchronously
 */
function getEnvSync(): "development" | "staging" | "production" | "test" {
  if (isServer) {
    try {
      const contextPath = path.join(os.homedir(), ".sous", "context.json");
      if (fs.existsSync(contextPath)) {
        const context = JSON.parse(fs.readFileSync(contextPath, "utf-8"));
        if (context.env) return context.env;
      }
    } catch (e) {}
  }

  const env = process.env.NODE_ENV || process.env.MODE || "development";
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
 * Synchronously builds the config from process.env
 */
function buildConfig(): Config {
  const envVars = process.env;
  const env = getEnvSync();

  let wslIp = "localhost";
  if (isServer) {
    try {
      const stdout = cp.execSync("ip route show default | awk '{print $3}'", { timeout: 500 }).toString().trim();
      if (stdout) wslIp = stdout;
    } catch (e) {}
  }

  const rawConfig = {
    env,
    api: {
      port: Number(envVars.PORT_API || 4000),
      url: ensureProtocol(envVars.API_URL || envVars.NEXT_PUBLIC_API_URL) || `http://${wslIp}:${envVars.PORT_API || 4000}`,
    },
    web: {
      port: Number(envVars.PORT_WEB || 3000),
      url: ensureProtocol(envVars.WEB_URL || envVars.NEXT_PUBLIC_WEB_URL) || `http://${wslIp}:${envVars.PORT_WEB || 3000}`,
    },
    docs: {
      port: Number(envVars.PORT_DOCS || 3001),
      url: ensureProtocol(envVars.DOCS_URL || envVars.NEXT_PUBLIC_DOCS_URL) || `http://${wslIp}:${envVars.PORT_DOCS || 3001}`,
    },
    db: {
      url: envVars.DATABASE_URL,
      readerUrl: envVars.DATABASE_URL_READ || envVars.DATABASE_URL,
    },
    redis: {
      url: envVars.REDIS_URL || (envVars.REDIS_HOST ? `redis://${envVars.REDIS_HOST}:${envVars.REDIS_PORT || 6380}` : undefined),
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
