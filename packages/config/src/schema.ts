import { z } from "zod";

export const configSchema = z
  .object({
    env: z
      .enum(["development", "staging", "production", "test"])
      .default("development"),

    // Infrastructure
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

    // Database & Cache
    db: z.object({
      url: z.string().url().optional(),
      readerUrl: z.string().url().optional(),
    }),
    redis: z.object({
      url: z.string().url().optional(),
    }),

    // Authentication
    iam: z.object({
      jwtSecret: z.string().min(10).optional(),
    }),

    // Storage & Media
    storage: z.object({
      supabase: z
        .object({
          url: z.string().url().optional(),
          anonKey: z.string().min(1).optional(),
          serviceRoleKey: z.string().min(1).optional(),
          bucket: z.string().default("media"),
        })
        .optional(),
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
      hyperdxApiKey: z.string().optional(),
    }),

    // Integrations
    square: z
      .object({
        accessToken: z.string().optional(),
        applicationId: z.string().optional(),
        clientSecret: z.string().optional(),
        redirectUri: z.string().optional(),
        environment: z.enum(["production", "sandbox"]).default("production"),
        merchantId: z.string().optional(),
        endpoint: z.string().optional(),
      })
      .default({}),

    google: z
      .object({
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        redirectUri: z.string().optional(),
      })
      .default({}),

    github: z
      .object({
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        redirectUri: z.string().optional(),
        token: z.string().optional(),
        repo: z.string().default("sous-tools/sous.tools"),
      })
      .default({}),

    facebook: z
      .object({
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        redirectUri: z.string().optional(),
      })
      .default({}),

    emails: z
      .object({
        support: z.string().email().default("support@sous.tools"),
        sales: z.string().email().default("sales@sous.tools"),
        notifications: z.string().email().default("notifications@sous.tools"),
        auth: z.string().email().default("auth@sous.tools"),
        billing: z.string().email().default("billing@sous.tools"),
      })
      .default({}),

    support: z
      .object({
        email: z.string().email().default("support@sous.tools"),
      })
      .default({}),

    ai: z
      .object({
        googleGenerativeAiApiKey: z.string().optional(),
      })
      .default({}),

    resend: z
      .object({
        apiKey: z.string().optional(),
        from: z.string().default("Sous <notifications@sous.tools>"),
      })
      .default({}),

    stripe: z
      .object({
        secretKey: z.string().optional(),
        publishableKey: z.string().optional(),
        webhookSecret: z.string().optional(),
      })
      .default({}),

    // Feature Flags & Environment Context
    features: z
      .object({
        enableRegistration: z.boolean().default(true),
        appVersion: z.string().default("0.1.0"),
        appEnv: z.string().default("development"),
      })
      .default({}),

    // Infisical Credentials (Bootstrap only)
    infisical: z
      .object({
        projectId: z.string().optional(),
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

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
