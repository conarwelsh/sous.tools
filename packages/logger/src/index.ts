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
    hyperdxApiKey?: string;
  };
}

/**
 * Initializes OpenTelemetry and distributed tracing via HyperDX
 */
export async function initObservability(config: LoggerConfig) {
  if (!isServer) return;
  
  const apiKey = config.logger.hyperdxApiKey;
  if (!apiKey) {
    console.log("ℹ️ HyperDX API Key not found. Skipping OpenTelemetry initialization.");
    return;
  }

  try {
    const hyperdxPkg = "@hyperdx/node-opentelemetry";
    const HyperDX = await import(/* webpackIgnore: true */ hyperdxPkg);
    
    // Temporarily silence console to suppress HyperDX bootstrap logs
    const originalLog = console.log;
    const originalInfo = console.info;
    if (config.logger.level !== 'debug') {
      console.log = () => {};
      console.info = () => {};
    }

    HyperDX.init({
      apiKey,
      serviceName: process.env.SERVICE_NAME || "@sous/core",
      consoleCapture: true, // Automatically capture console logs
    } as any);

    // Restore console
    console.log = originalLog;
    console.info = originalInfo;

    if (config.logger.level === 'debug') {
      console.log("✅ Observability initialized with HyperDX");
    }
  } catch (e: any) {
    console.error(`❌ Failed to initialize HyperDX: ${e.message}`);
  }
}

export function createLogger(options: { name: string; config?: LoggerConfig }) {
  const transports: any[] = [];
  
  // Use provided config or safe fallbacks for bootstrap/browser
  const logConfig = options.config || {
    env: isServer ? (process.env.NODE_ENV || "development") : "development",
    logger: {
      level: isServer ? (process.env.LOG_LEVEL || "info") : "info",
      json: isServer ? (process.env.SOUS_JSON_LOGS === "true") : false,
      logtailToken: isServer ? process.env.LOGTAIL_SOURCE_TOKEN : undefined,
      hyperdxApiKey: isServer ? process.env.HYPERDX_API_KEY : undefined,
    }
  };

  const isDev = logConfig.env === "development";

  // Transports are only supported on server in Pino
  if (isServer) {
    // 1. Centralized Local Log File
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home && !isDev) { 
      transports.push({
        target: "pino/file",
        options: { destination: `${home}/.sous/logs/combined.log`, mkdir: true },
      });
    }

    // 2. Remote Transport (Better Stack / Logtail)
    if (logConfig.logger.logtailToken) {
      transports.push({
        target: "@logtail/pino",
        options: { sourceToken: logConfig.logger.logtailToken },
      });
    }

    // 3. HyperDX / OpenTelemetry
    // Note: If initObservability was called, consoleCapture: true will already pipe logs.
    // However, for more structured pino logs, we could add a specific transport here.
    // For now, consoleCapture is sufficient for a basic replacement.
  }

  const baseLogger = pino(
    {
      name: options.name,
      level: logConfig.logger.level,
      mixin() {
        const store = loggerStorage?.getStore?.();
        return store ? Object.fromEntries(store) : {};
      },
      browser: isServer ? undefined : { asObject: true },
      transport: isServer && transports.length > 0
        ? { targets: transports }
        : (isDev ? { target: "pino-pretty" } : undefined),
    }
  );

  return baseLogger;
}

// Global default instance
logger = createLogger({ name: "@sous/core" });

export { logger };