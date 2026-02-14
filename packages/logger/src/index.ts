import pino from "pino";

const isServer = typeof window === "undefined";

// Storage for Request Context (Trace IDs, User IDs, etc.)
let loggerStorage: any = null;

// Global default logger placeholder
let logger: any;

export { loggerStorage };

/**
 * Interface for configuration to avoid circular dependency
 */
interface LoggerConfig {
  env: string;
  logger: {
    level: string;
    json: boolean;
    logtailToken?: string;
  };
}

export function createLogger(options: { name: string; config?: LoggerConfig }) {
  const transports: any[] = [];

  // Use provided config or safe fallbacks for bootstrap/browser
  const logConfig = options.config || {
    env: isServer ? process.env.NODE_ENV || "development" : "development",
    logger: {
      level: isServer ? process.env.LOG_LEVEL || "info" : "info",
      json: isServer ? process.env.SOUS_JSON_LOGS === "true" : false,
      logtailToken: isServer ? process.env.LOGTAIL_SOURCE_TOKEN : undefined,
    },
  };

  const isDev = logConfig.env === "development";
  const useJson = logConfig.logger.json;

  // Transports are only supported on server in Pino
  if (isServer) {
    // 1. Centralized Local Log File
    // Note: We avoid dynamic path detection here to keep it stable
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home && !isDev) {
      // Only file log in prod/staging to save I/O in dev
      transports.push({
        target: "pino/file",
        options: {
          destination: `${home}/.sous/logs/combined.log`,
          mkdir: true,
        },
      });
    }

    // 2. Remote Transport (Better Stack / Logtail)
    if (logConfig.logger.logtailToken) {
      transports.push({
        target: "@logtail/pino",
        options: { sourceToken: logConfig.logger.logtailToken },
      });
    }
  }

  const baseLogger = pino({
    name: options.name,
    level: logConfig.logger.level,
    mixin() {
      const store = loggerStorage?.getStore?.();
      return store ? Object.fromEntries(store) : {};
    },
    browser: isServer ? undefined : { asObject: true },
    transport:
      isServer && transports.length > 0 ? { targets: transports } : undefined,
  });

  return baseLogger;
}

// Global default instance
// In a fully refactored state, we would pass the resolved config here
logger = createLogger({ name: "@sous/core" });

export { logger };
