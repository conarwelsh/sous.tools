import { z } from 'zod';

export const configSchema = z.object({
  env: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  api: z.object({
    port: z.coerce.number().default(4000),
    url: z.string().url().optional(),
  }),
  web: z.object({
    port: z.coerce.number().default(3000),
    url: z.string().url().optional(),
  }),
  docs: z.object({
    port: z.coerce.number().default(3001),
    url: z.string().url().optional(),
  }),
  native: z.object({
    port: z.coerce.number().default(1421),
  }),
  headless: z.object({
    port: z.coerce.number().default(1422),
  }),
  kds: z.object({
    port: z.coerce.number().default(1423),
  }),
  pos: z.object({
    port: z.coerce.number().default(1424),
  }),
  infisical: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    projectId: z.string().optional(),
  }).optional(),
  db: z.object({
    url: z.string().url().optional(),
  }),
  redis: z.object({
    url: z.string().url().optional(),
  }),
  iam: z.object({
    jwtSecret: z.string().default('sous-secret-key'),
  }).optional(),
  storage: z.object({
    supabase: z.object({
      url: z.string().url().optional(),
      anonKey: z.string().optional(),
      bucket: z.string().default('media'),
    }),
    cloudinary: z.object({
      cloudName: z.string().optional(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
    }),
  }).optional(),
}).passthrough();

export type Config = z.infer<typeof configSchema>;

export const brandingConfigSchema = z.record(
  z.string(),
  z.object({
    variant: z.enum(['neon', 'plate', 'link', 'dot']).default('neon'),
    size: z.number(),
    props: z.record(z.string(), z.any()).default({}),
  })
);

export type BrandingConfig = z.infer<typeof brandingConfigSchema>;
