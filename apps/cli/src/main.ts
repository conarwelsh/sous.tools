import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Use 'error' level only to suppress the [Nest] startup logs for a cleaner TUI
  await CommandFactory.run(AppModule, ['error']);
}

bootstrap();