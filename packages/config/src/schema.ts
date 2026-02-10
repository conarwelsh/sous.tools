import { z } from "zod";

export const configSchema = z.object({
  env: z.enum(["development", "staging", "production", "test"]).default("development"),
  
  // Infrastructure
  api: z.object({
    port: z.coerce.number().default(4000),
    url: z.string().url(),
  }),
  web: z.object({
    port: z.coerce.number().default(3000),
    url: z.string().url(),
  }),
  docs: z.object({
    port: z.coerce.number().default(3001),
    url: z.string().url(),
  }),
  
  // Database & Cache
  db: z.object({
    url: z.string().url(),
  }),
  redis: z.object({
    url: z.string().url(),
  }),
  
  // Authentication
  iam: z.object({
    jwtSecret: z.string().min(10),
  }),
  
  // Storage & Media
  storage: z.object({
    supabase: z.object({
      url: z.string().url(),
      anonKey: z.string().min(1),
      serviceRoleKey: z.string().min(1).optional(),
      bucket: z.string().default("media"),
    }),
    cloudinary: z.object({
      cloudName: z.string().optional(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
    }),
  }),

  // Logging & Monitoring
  logger: z.object({
    level: z.enum(["debug", "info", "warn", "error"]).default("info"),
    json: z.boolean().default(false),
    logtailToken: z.string().optional(),
  }),

  // Feature Flags & Environment Context
  features: z.object({
    enableRegistration: z.boolean().default(true),
    appVersion: z.string().default("0.1.0"),
    appEnv: z.string().default("development"),
  }).default({}),

  // Infisical Credentials (Bootstrap only)
  infisical: z.object({
    projectId: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }).optional(),
}).passthrough();

export type Config = z.infer<typeof configSchema>;

// Branding remains separate as it's often a dynamic record
export const brandingConfigSchema = z.record(
  z.string(),
  z.object({
    variant: z.string(),
    size: z.number(),
    props: z.record(z.string(), z.any()).default({}),
  }),
);

export type BrandingConfig = z.infer<typeof brandingConfigSchema>;