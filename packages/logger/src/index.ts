import pino from "pino";

const isServer = typeof window === "undefined";

// Storage for Request Context (Trace IDs, User IDs, etc.)
// Only available on server
let loggerStorage: any = null;

// Global default logger placeholder
let logger: any;

export { loggerStorage };

export function createLogger(options: { name: string }) {
  const transports: any[] = [];

  const isDev = !isServer ? true : process.env.NODE_ENV === "development";
  const useJson = isServer && process.env.SOUS_JSON_LOGS === "true";

  // Transports are only supported on server in Pino
  if (isServer) {
    // 1. Local Development Pretty Printing (unless JSON is requested by dev tools)
    if (isDev && !useJson) {
      transports.push({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
          messageFormat: `[{name}] {msg}`,
        },
      });
    }

    // 2. Centralized Local Log File (God View)
    // We try to use a static path if we can't load 'os' and 'path'
    // But we'll try to load them dynamically to be safe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let logFile: string | null = null;

    // In a real monorepo, we'd probably pass the log path in config
    // but for now we try to detect home dir
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) {
      // We use a simple join to avoid needing 'path'
      const logDir = `${home}/.sous/logs`;
      logFile = `${logDir}/combined.log`;

      transports.push({
        target: "pino/file",
        options: { destination: logFile, mkdir: true },
      });
    }

    // 3. Remote Transport (Better Stack / Logtail)
    if (process.env.LOGTAIL_SOURCE_TOKEN) {
      transports.push({
        target: "@logtail/pino",
        options: { sourceToken: process.env.LOGTAIL_SOURCE_TOKEN },
      });
    }
  }

  const baseLogger = pino(
    {
      name: options.name,
      level: isServer ? process.env.LOG_LEVEL || "info" : "info",
      // Automatic Context Injection
      mixin() {
        const store = loggerStorage?.getStore?.();
        if (store) {
          return Object.fromEntries(store);
        }
        return {};
      },
      browser: isServer
        ? undefined
        : {
            asObject: true,
          },
    },
    isServer && transports.length > 0
      ? pino.transport({ targets: transports })
      : undefined,
  );

  return baseLogger;
}

// Global initialization
logger = createLogger({ name: "@sous/core" });

export { logger };
