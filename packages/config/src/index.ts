import {
  configSchema,
  type Config,
  brandingConfigSchema,
  type BrandingConfig,
} from "./schema.js";

const isServer = typeof window === "undefined";

/**
 * Robustly finds the project root by looking for pnpm-workspace.yaml
 */
function findRoot(): string {
  if (!isServer) return "";
  
  try {
    const fs = eval('require("fs")');
    const path = eval('require("path")');
    let current = process.cwd();
    
    while (current !== "/" && !fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return current;
  } catch (e) {
    return process.cwd();
  }
}

/**
 * Synchronously loads environment variables from .env and Infisical.
 * This runs ONLY on the server during module initialization.
 */
function bootstrap() {
  if (!isServer) return;

  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) return;

  try {
    // Check if require exists (CJS environment)
    // We use a check that won't be shimmed by esbuild
    let req: any;
    try {
      req = eval('require');
    } catch (e) {
      // In ESM Node.js, eval('require') will throw. 
      // We skip bootstrap and rely on external env population.
      return;
    }

    if (!req || typeof req !== 'function') return;

    const fs = req("fs");
    const path = req("path");
    const dotenv = req("dotenv");
    const child_process = req("child_process");

    const root = findRoot();

    // 1. Load bootstrap variables from .env if present
    const envPath = path.join(root, ".env");
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }

    // 2. Load from Infisical if in development and missing critical keys
    const isNext = !!process.env.NEXT_RUNTIME;
    const hasProjectId = !!process.env.INFISICAL_PROJECT_ID;
    
    if (!isNext && !process.env.DATABASE_URL && hasProjectId) {
      try {
        const { execSync } = child_process;
        const projectId = process.env.INFISICAL_PROJECT_ID;
        const envName = "dev";
        
        console.log(`🔐 [@sous/config] Fetching secrets from Infisical (Project: ${projectId}, Env: ${envName})...`);
        
        const output = execSync(
          `infisical export --projectId ${projectId} --env ${envName} --format json`,
          { 
            encoding: "utf8", 
            stdio: ["ignore", "pipe", "ignore"],
            env: { ...process.env }
          }
        );
        
        const secrets = JSON.parse(output);
        if (Array.isArray(secrets)) {
          let count = 0;
          for (const { key, value } of secrets) {
            if (!process.env[key]) {
              process.env[key] = value;
              count++;
            }
          }
          if (count > 0) {
            console.log(`✅ [@sous/config] Population complete. Injected ${count} new variables.`);
          }
        }
      } catch (e: any) {
        console.warn("⚠️ [@sous/config] Infisical CLI fetch failed. Ensure CLI is installed and authenticated.");
      }
    }
  } catch (e) {
    // Silently ignore bootstrap failures in environments where require is unavailable (ESM)
  }
}

/**
 * Normalizes environment variables from process.env or globalThis.
 */
const getEnvVars = () => {
  if (isServer) return process.env;
  return (globalThis as any).process?.env || (globalThis as any).__SOUS_ENV__ || {};
};

function sanitizeUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  // If it's a relative URL (like /api), keep it as is for some environments, 
  // but usually we want absolute for the SDK
  if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

/**
 * Builds the configuration object from current environment variables.
 */
function buildConfig(): Config {
  const envVars = getEnvVars();
  const env = envVars.NODE_ENV || (envVars as any).MODE || "development";

  // Priority: 1. Explicit Service URL, 2. NEXT_PUBLIC version (for web), 3. Fallback
  const apiUrl = sanitizeUrl(
    envVars.API_URL || envVars.NEXT_PUBLIC_API_URL,
    `http://localhost:${envVars.PORT_API || envVars.API_PORT || 4000}`
  );

  const webUrl = sanitizeUrl(
    envVars.WEB_URL || envVars.NEXT_PUBLIC_WEB_URL,
    `http://localhost:${envVars.PORT_WEB || envVars.WEB_PORT || 3000}`
  );

  const rawConfig = {
    env,
    api: {
      port: Number(envVars.PORT_API || envVars.API_PORT || 4000),
      url: apiUrl,
    },
    web: {
      port: Number(envVars.PORT_WEB || envVars.WEB_PORT || 3000),
      url: webUrl,
    },
    docs: {
      port: Number(envVars.PORT_DOCS || envVars.DOCS_PORT || 3001),
      url: sanitizeUrl(
        envVars.DOCS_URL,
        `http://localhost:${envVars.PORT_DOCS || 3001}`
      ),
    },
    native: {
      port: Number(envVars.NATIVE_PORT || 1421),
    },
    headless: {
      port: Number(envVars.HEADLESS_PORT || 1422),
    },
    kds: {
      port: Number(envVars.KDS_PORT || 1423),
    },
    pos: {
      port: Number(envVars.POS_PORT || 1424),
    },
    db: {
      url: envVars.DATABASE_URL,
    },
    redis: {
      url: envVars.REDIS_URL,
    },
    iam: {
      jwtSecret: envVars.JWT_SECRET || "sous-secret-key",
    },
    storage: {
      supabase: {
        url: envVars.SUPABASE_URL,
        anonKey: envVars.SUPABASE_ANON_KEY,
        bucket: envVars.SUPABASE_BUCKET || "media",
      },
      cloudinary: {
        cloudName: envVars.CLOUDINARY_CLOUD_NAME,
        apiKey: envVars.CLOUDINARY_API_KEY,
        apiSecret: envVars.CLOUDINARY_API_SECRET,
      },
    },
  };

  const parsed = configSchema.safeParse(rawConfig);
  
  if (!parsed.success) {
    if (isServer) {
      console.error("❌ [@sous/config] Invalid configuration structure:", JSON.stringify(parsed.error.format(), null, 2));
      console.error("⚠️ [@sous/config] Raw Invalid Config (partial):", JSON.stringify({
        api: rawConfig.api,
        web: rawConfig.web,
        db: rawConfig.db
      }, null, 2));
    }
    return rawConfig as any;
  }

  return parsed.data;
}

// 1. Run bootstrap immediately on import (Server only)
if (isServer) {
  bootstrap();
}

/**
 * Server-side configuration. Contains all secrets.
 * NEVER use this in client-side code.
 */
export const server = buildConfig();

/**
 * Client-side configuration. Filtered to only include public variables.
 */
export const client = (() => {
  const fullConfig = server;
  const envVars = getEnvVars();
  
  // Extract all keys starting with NEXT_PUBLIC_ or VITE_
  const publicEnv: Record<string, string> = {};
  for (const key in envVars) {
    if (key.startsWith("NEXT_PUBLIC_") || key.startsWith("VITE_")) {
      publicEnv[key] = envVars[key]!;
    }
  }

  // Merge the structured public parts of the config
  return {
    env: fullConfig.env,
    api: fullConfig.api,
    web: fullConfig.web,
    docs: fullConfig.docs,
    ...publicEnv,
  } as const;
})();

// Helper exports
export const localConfig = server;
export const getActiveConfig = () => server;
export const configPromise = Promise.resolve(server);
export const getConfig = async () => server;

/**
 * Secret management utility. Only available on server.
 */
export const secrets = isServer ? (() => {
  try {
    const SecretManager = eval('require("./secrets.js").SecretManager');
    return new SecretManager();
  } catch (e) {
    return null;
  }
})() : null;

export { configSchema, brandingConfigSchema, type Config, type BrandingConfig };
