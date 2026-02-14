import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { SecretManager } from "./secrets.js";

export { SecretManager };

const bootstrapEnvSchema = z.object({
  INFISICAL_PROJECT_ID: z
    .string()
    .min(1, "INFISICAL_PROJECT_ID is required in .env"),
  INFISICAL_CLIENT_ID: z
    .string()
    .min(1, "INFISICAL_CLIENT_ID is required in .env"),
  INFISICAL_CLIENT_SECRET: z
    .string()
    .min(1, "INFISICAL_CLIENT_SECRET is required in .env"),
});

export type BootstrapEnv = z.infer<typeof bootstrapEnvSchema>;

/**
 * Finds project root by looking for pnpm-workspace.yaml synchronously
 */
export function findProjectRootSync(): string {
  let current = process.cwd();
  while (
    current !== "/" &&
    !fs.existsSync(path.join(current, "pnpm-workspace.yaml"))
  ) {
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
  const root = findProjectRootSync();
  const envPath = path.join(root, ".env");

  if (!fs.existsSync(envPath)) {
    throw new Error(
      `.env file not found at ${envPath}. It MUST contain INFISICAL_ credentials.`,
    );
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};

  content.split("\n").forEach((line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...values] = trimmed.split("=");
    if (key && values.length > 0) {
      env[key.trim()] = values
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  });

  const result = bootstrapEnvSchema.safeParse(env);
  if (!result.success) {
    console.error("❌ [@sous/config] Invalid .env file structure:");
    result.error.errors.forEach((err) =>
      console.error(`  - ${err.path.join(".")}: ${err.message}`),
    );
    throw new Error("Invalid .env configuration");
  }

  return result.data;
}
