import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Suppress React 19 / Ink deprecation warnings by silencing console.error for specific patterns
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('deprecation')) return;
    originalError(...args);
  };

  // Use 'error' level only to suppress the [Nest] startup logs for a cleaner TUI
  await CommandFactory.run(AppModule, ['error']);
}

bootstrap();
