import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

// Storage for Request Context (Trace IDs, User IDs, etc.)
export const loggerStorage = new AsyncLocalStorage<Map<string, any>>();

const isDev = process.env.NODE_ENV === 'development';
const useJson = process.env.SOUS_JSON_LOGS === 'true';

export function createLogger(options: { name: string }) {
  const transports: any[] = [];

  // 1. Local Development Pretty Printing (unless JSON is requested by orchestrator)
  if (isDev && !useJson) {
    transports.push({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        messageFormat: `[{name}] {msg}`,
      },
    });
  }

  // 2. Remote Transport (Better Stack / Logtail)
  if (process.env.LOGTAIL_SOURCE_TOKEN) {
    transports.push({
      target: '@logtail/pino',
      options: { sourceToken: process.env.LOGTAIL_SOURCE_TOKEN },
    });
  }

  const baseLogger = pino(
    {
      name: options.name,
      level: process.env.LOG_LEVEL || 'info',
      // Automatic Context Injection
      mixin() {
        const store = loggerStorage.getStore();
        if (store) {
          return Object.fromEntries(store);
        }
        return {};
      },
    },
    transports.length > 0 ? pino.transport({ targets: transports }) : undefined
  );

  return baseLogger;
}

// Global default logger
export const logger = createLogger({ name: '@sous/core' });
