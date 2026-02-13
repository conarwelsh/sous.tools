import {
  configSchema,
  brandingConfigSchema,
  type Config,
  type BrandingConfig,
} from "./schema.js";
import { SecretManager } from "./secrets.js";

const isServer = typeof window === "undefined";

/**
 * Singleton secrets manager instance
 */
export const secrets = new SecretManager();

export { configSchema, brandingConfigSchema, type BrandingConfig };

/**
 * Singleton configuration instance
 */
let cachedConfig: Config | null = null;
let isFullyResolved = false;

/**
 * Ensures a string has a protocol, defaulting to https:// if missing
 */
function ensureProtocol(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url === "undefined" || url === "null") return undefined;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    // If it's a local address without protocol, use http
    if (url.startsWith("localhost") || url.startsWith("127.0.0.1") || url.startsWith("172.") || url.startsWith("192.") || url.startsWith("10.")) {
      return `http://${url}`;
    }
    return `https://${url}`;
  }
  return url;
}

/**
 * Normalizes environment name
 */
async function getEnv(): Promise<"development" | "staging" | "production" | "test"> {
  // 1. Check for context override file (Local Dev only)
  if (isServer) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");
      const contextPath = path.join(os.homedir(), ".sous", "context.json");
      if (fs.existsSync(contextPath)) {
        const context = JSON.parse(fs.readFileSync(contextPath, "utf-8"));
        if (context.env) return context.env;
      }
    } catch (e) {
      // Ignore errors reading context
    }
  }

  const env = process.env.NODE_ENV || process.env.MODE || "development";
  if (env === "prod") return "production";
  if (env === "stage") return "staging";
  if (env === "dev") return "development";
  return env as any;
}

/**
 * Finds project root by looking for pnpm-workspace.yaml
 */
async function findProjectRoot(): Promise<string> {
  if (!isServer) return "";
  const fs = await import("fs");
  const path = await import("path");
  let current = process.cwd();
  while (current !== "/" && !fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return current;
}

/**
 * Fetches secrets from Infisical using the SecretManager (Server only)
 */
async function fetchVaultSecrets(env: string): Promise<Record<string, string>> {
  if (!isServer) return {};
  try {
    return await secrets.listSecrets(env);
  } catch (error) {
    console.warn("⚠️  [@sous/config] Vault fetch failed, falling back to process.env/cli");
    return {};
  }
}

/**
 * Normalizes public environment variables for the client
 */
function getPublicEnv() {
  if (isServer) {
    const envVars: any = process.env || {};
    const publicEnv: Record<string, string> = {};
    for (const key in envVars) {
      if (key.startsWith("NEXT_PUBLIC_") || key.startsWith("VITE_")) {
        publicEnv[key] = envVars[key]!;
      }
    }
    return publicEnv;
  } else {
    // Browser side - Next.js bakes these in if we reference them explicitly
    // This is critical for static analysis during Next.js build
    return {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
      NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_ENABLE_REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  }
}

/**
 * Builds a configuration object from pre-calculated environment variables
 * (Used for client-side where we can't fetch from Infisical)
 */
function buildPublicConfig(): Config {
  const envVars = getPublicEnv();
  const env = (envVars.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development") as any;
  const isDev = env === "development" || env === "dev";

  return {
    env,
    api: {
      port: 4000,
      url: ensureProtocol(envVars.NEXT_PUBLIC_API_URL) || (isDev ? "http://localhost:4000" : undefined),
    },
    web: {
      port: 3000,
      url: ensureProtocol(envVars.NEXT_PUBLIC_WEB_URL) || (isDev ? "http://localhost:3000" : undefined),
    },
    docs: {
      port: 3001,
      url: ensureProtocol(envVars.NEXT_PUBLIC_DOCS_URL) || (isDev ? "http://localhost:3001" : undefined),
    },
    features: {
      enableRegistration: envVars.NEXT_PUBLIC_ENABLE_REGISTRATION !== "false",
      appVersion: envVars.NEXT_PUBLIC_APP_VERSION || "0.1.0",
      appEnv: env,
    },
    // Other fields as empty/defaults for client
    db: { url: isDev ? "postgres://sous_user:sous_password@localhost:5433/sous_db" : "" },
    redis: { url: isDev ? "redis://localhost:6380" : "" },
    iam: { jwtSecret: "" },
    storage: {
      supabase: { url: "", anonKey: "", bucket: "media" },
    },
    logger: { level: "info", json: false },
  } as Config;
}

/**
 * Resolves the configuration object
 */
export async function resolveConfig(): Promise<Config> {
  if (isFullyResolved && cachedConfig) return cachedConfig;

  // Load .env from project root if server-side
  if (isServer) {
    try {
      const { config: loadDotenv } = await import("dotenv");
      const path = await import("path");
      const fs = await import("fs");
      const root = await findProjectRoot();
      
      // 1. Load from package (defaults)
      const envPath = path.join(root, "packages/config/.env");
      if (fs.existsSync(envPath)) {
        loadDotenv({ path: envPath, override: true });
      }

      // 2. Load from root (overrides package)
      const rootEnvPath = path.join(root, ".env");
      if (fs.existsSync(rootEnvPath)) {
        loadDotenv({ path: rootEnvPath, override: true });
      }
    } catch (e) {
      // Ignore errors loading .env
    }
  }

  if (!isServer) {
    cachedConfig = buildPublicConfig();
    isFullyResolved = true;
    return cachedConfig;
  }

  const env = await getEnv();
  const envVars = { ...process.env };

  // 0. Dynamic WSL IP Detection
  let wslIp = "localhost";
  if (isServer) {
    try {
      const cp = await import("child_process");
      const stdout = cp.execSync("ip route show default | awk '{print $3}'").toString().trim();
      if (stdout) wslIp = stdout;
    } catch (e) {
      // Fallback to localhost
    }
  }

  // 1. Fetch from Vault if server-side and credentials exist
  if (isServer && env !== "test") {
    const vaultSecrets = await fetchVaultSecrets(env);
    Object.assign(envVars, vaultSecrets);
    
    // Export to process.env so child processes (like drizzle-kit) can see them
    for (const [key, value] of Object.entries(vaultSecrets)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }

    // Ensure public equivalents are set for critical variables if they exist in vault without prefix
    if (process.env.API_URL && !process.env.NEXT_PUBLIC_API_URL) process.env.NEXT_PUBLIC_API_URL = process.env.API_URL;
    if (process.env.WEB_URL && !process.env.NEXT_PUBLIC_WEB_URL) process.env.NEXT_PUBLIC_WEB_URL = process.env.WEB_URL;
    if (process.env.DOCS_URL && !process.env.NEXT_PUBLIC_DOCS_URL) process.env.NEXT_PUBLIC_DOCS_URL = process.env.DOCS_URL;
    if (process.env.APP_ENV && !process.env.NEXT_PUBLIC_APP_ENV) process.env.NEXT_PUBLIC_APP_ENV = process.env.APP_ENV;
  }

  // 2. Map environment variables to schema
  const rawConfig = {
    env,
    api: {
      port: Number(envVars.PORT_API || 4000),
      url: ensureProtocol(envVars.API_URL) || 
           ensureProtocol(envVars.NEXT_PUBLIC_API_URL) || 
           `http://${wslIp}:${envVars.PORT_API || 4000}`,
    },
    web: {
      port: Number(envVars.PORT_WEB || 3000),
      url: ensureProtocol(envVars.WEB_URL) || 
           ensureProtocol(envVars.NEXT_PUBLIC_WEB_URL) || 
           `http://${wslIp}:${envVars.PORT_WEB || 3000}`,
    },
    docs: {
      port: Number(envVars.PORT_DOCS || 3001),
      url: ensureProtocol(envVars.DOCS_URL) || 
           ensureProtocol(envVars.NEXT_PUBLIC_DOCS_URL) || 
           `http://${wslIp}:${envVars.PORT_DOCS || 3001}`,
    },
    db: {
      url: envVars.DATABASE_URL || "postgres://sous_user:sous_password@localhost:5433/sous_db",
    },
    redis: {
      url: envVars.REDIS_URL || (envVars.REDIS_HOST ? `redis://${envVars.REDIS_HOST}:${envVars.REDIS_PORT || 6380}` : "redis://localhost:6380"),
    },
    iam: {
      jwtSecret: envVars.JWT_SECRET || envVars.SESSION_SECRET || "fallback-secret-too-short",
    },
    storage: {
      supabase: {
        url: envVars.SUPABASE_URL || "http://localhost:54321",
        anonKey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY || envVars.SUPABASE_PASSWORD || "placeholder",
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
    },
    features: {
      enableRegistration: envVars.ENABLE_REGISTRATION !== "false",
      appVersion: envVars.NEXT_PUBLIC_APP_VERSION || envVars.APP_VERSION || "0.1.0",
      appEnv: env,
    },
    infisical: {
      projectId: envVars.INFISICAL_PROJECT_ID,
      clientId: envVars.INFISICAL_CLIENT_ID,
      clientSecret: envVars.INFISICAL_CLIENT_SECRET,
    },
    square: {
      accessToken: envVars.SQUARE_ACCESS_TOKEN || envVars.SQUARE_CLIENT_SECRET,
      applicationId: envVars.SQUARE_APPLICATION_ID,
      clientSecret: envVars.SQUARE_CLIENT_SECRET,
      redirectUri: envVars.SQUARE_REDIRECT_URI,
      merchantId: envVars.SQUARE_MERCHANT_ID,
      endpoint: envVars.SQUARE_ENDPOINT,
      environment: envVars.SQUARE_ENVIRONMENT === "sandbox" || (envVars.SQUARE_ENDPOINT && envVars.SQUARE_ENDPOINT.includes("sandbox")) ? "sandbox" : "production",
    },
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      redirectUri: envVars.GOOGLE_REDIRECT_URI,
    },
    ai: {
      googleGenerativeAiApiKey: envVars.GOOGLE_GENERATIVE_AI_API_KEY,
    }
  };

  const result = configSchema.safeParse(rawConfig);
  if (!result.success) {
    cachedConfig = rawConfig as any;
  } else {
    cachedConfig = result.data;
  }

  isFullyResolved = true;
  return cachedConfig!;
}

/**
 * Promise that resolves to the configuration
 */
export const configPromise = resolveConfig();

/**
 * Synchronous access to configuration. 
 */
export const config = (() => {
  // Client-side initialization: if we're in the browser, we can pre-build
  if (!isServer && !cachedConfig) {
    cachedConfig = buildPublicConfig();
    isFullyResolved = true;
  }

  return new Proxy({} as Config, {
    get(_, prop) {
      if (!cachedConfig) {
        if (!isServer) {
           cachedConfig = buildPublicConfig();
           isFullyResolved = true;
        } else {
           // Fallback to public config even on server if it's accessed before resolveConfig
           return buildPublicConfig()[prop as keyof Config];
        }
      }
      return (cachedConfig as any)[prop];
    }
  });
})();

// For legacy support while refactoring
export const server = config;
export const client = config;
export const localConfig = config;
