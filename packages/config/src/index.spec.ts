import { config, configSchema } from "./index";

// Mock dependencies
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

jest.mock("@infisical/sdk", () => ({
  InfisicalSDK: jest.fn().mockImplementation(() => ({
    auth: () => ({
      universalAuth: {
        login: jest.fn().mockResolvedValue({}),
      },
    }),
    secrets: () => ({
      listSecrets: jest.fn().mockResolvedValue({
        secrets: [{ secretKey: "REMOTE_VAR", secretValue: "remote-value" }],
      }),
    }),
  })),
}));

describe("@sous/config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("Validation Schema", () => {
    it("should validate correct config", () => {
      const validConfig = {
        env: "development",
        api: { port: 4000, url: "http://localhost:4000" },
        web: { port: 3000, url: "http://localhost:3000" },
        docs: { port: 3001, url: "http://localhost:3001" },
        db: { url: "postgres://localhost:5432/sous" },
        redis: { url: "redis://localhost:6379" },
        iam: { jwtSecret: "test-secret-long-enough" },
        storage: {
          supabase: {
            url: "http://localhost:54321",
            anonKey: "test-key",
          },
          cloudinary: {}
        },
        logger: {
          level: "info",
          json: false
        }
      };
      const result = configSchema.safeParse(validConfig);
      if (!result.success) {
        console.log("Validation Errors:", JSON.stringify(result.error.format(), null, 2));
      }
      expect(result.success).toBe(true);
    });

    it("should fail on invalid url", () => {
      const invalidConfig = {
        env: "development",
        api: { port: 3000, url: "not-a-url" },
        web: {},
        db: {},
        redis: {},
      };
      const result = configSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe("config", () => {
    it("should return default development config", () => {
      expect(config.env).toBe("test");
      expect(config.api.port).toBe(4000);
    });
  });
});
