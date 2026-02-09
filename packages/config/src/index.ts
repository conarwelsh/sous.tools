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
    // Use eval('require') to prevent bundlers from trying to bundle Node.js modules
    const _require = eval("require");
    const path = _require("path");
    const fs = _require("fs");
    
    let current = process.cwd();
    // Try to go up a few levels to find the monorepo root
    for (let i = 0; i < 5; i++) {
      if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) return current;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  } catch (e) {
    // Fallback
  }
  return process.cwd();
}

/**
 * Synchronously loads environment variables from .env and Infisical.
 * This runs ONLY on the server during module initialization.
 */
function bootstrap() {
  if (!isServer) return;

  try {
    const _require = eval("require");
    const path = _require("path");
    const fs = _require("fs");
    const root = findRoot();
    
    // 1. Load bootstrap variables from .env if present
    const envPath = path.join(root, ".env");
    if (fs.existsSync(envPath)) {
      try {
        _require("dotenv").config({ path: envPath });
      } catch (e) {
        // Dotenv might not be available in the runtime (e.g. Next.js server components)
        // or we are in an environment that doesn't need it.
      }
    }

    // 2. Load from Infisical if in development and missing critical keys
    // We only do this if NOT in a Next.js runtime, as Next handles its own env
    const isNext = !!process.env.NEXT_RUNTIME;
    const isDev = process.env.NODE_ENV !== "production";
    const hasProjectId = !!process.env.INFISICAL_PROJECT_ID;
    
    if (!isNext && isDev && !process.env.DATABASE_URL && hasProjectId) {
      try {
        const { execSync } = _require("child_process");
        const projectId = process.env.INFISICAL_PROJECT_ID;
        const envName = "dev";
        
        console.log(`🔐 [@sous/config] Fetching secrets from Infisical (Project: ${projectId}, Env: ${envName})...`);
        
        const output = execSync(
          `infisical export --projectId ${projectId} --env ${envName} --format json`,
          { 
            encoding: "utf8", 
            stdio: ['ignore', 'pipe', 'ignore'],
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
    console.error("❌ [@sous/config] Critical error during bootstrap:", e);
  }
}

/**
 * Normalizes environment variables from process.env or globalThis.
 */
const getEnvVars = () => {
  if (isServer) return process.env;
  return (globalThis as any).process?.env || (globalThis as any).__SOUS_ENV__ || {};
};

/**
 * Builds the configuration object from current environment variables.
 */
function buildConfig(): Config {
  const envVars = getEnvVars();
  const env = envVars.NODE_ENV || (envVars as any).MODE || "development";

  const rawConfig = {
    env,
    api: {
      port: Number(envVars.PORT_API || envVars.API_PORT || 4000),
      url: envVars.NEXT_PUBLIC_API_URL || envVars.API_URL || `http://localhost:${envVars.PORT_API || 4000}`,
    },
    web: {
      port: Number(envVars.PORT_WEB || envVars.WEB_PORT || 3000),
      url: envVars.NEXT_PUBLIC_WEB_URL || envVars.WEB_URL || `http://localhost:${envVars.PORT_WEB || 3000}`,
    },
    docs: {
      port: Number(envVars.PORT_DOCS || envVars.DOCS_PORT || 3001),
      url: envVars.DOCS_URL || `http://localhost:${envVars.PORT_DOCS || 3001}`,
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

export { configSchema, brandingConfigSchema, type Config, type BrandingConfig };