import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import React from 'react';
import { render } from 'ink';
import { Dashboard as DashboardUI } from '../dev/ui/dashboard.js';
import { ProcessManager } from '../dev/process-manager.service.js';
import { Inject } from '@nestjs/common';

interface DashboardOptions {
  env?: string;
}

@SubCommand({
  name: 'dashboard',
  description: 'View infrastructure health and service metrics',
})
export class DashboardCommand extends CommandRunner {
  constructor(
    @Inject(ProcessManager) private readonly manager: ProcessManager,
  ) {
    super();
  }

  async run(passedParam: string[], options?: DashboardOptions): Promise<void> {
    const env = options?.env || 'dev';
    logger.info(
      `📊 Opening Infrastructure Dashboard for environment: ${env}...`,
    );

    // In a real standalone dashboard, we would only show the 'infra' tab
    // For now, we reuse the existing Dev Dashboard but we could specialize it further
    const { waitUntilExit } = render(
      React.createElement(DashboardUI, { manager: this.manager }),
    );

    await waitUntilExit();
  }

  @Option({
    flags: '-e, --env [env]',
    description: 'Target environment (dev, staging, prod)',
    defaultValue: 'dev',
  })
  parseEnv(val: string): string {
    return val;
  }
}
