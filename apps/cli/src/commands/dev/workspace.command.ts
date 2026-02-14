import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { ProcessManager } from '../../services/process-manager.service.js';

@SubCommand({
  name: 'workspace',
  description: 'Manage development workspaces and window layouts',
})
export class WorkspaceCommand extends CommandRunner {
  constructor(private readonly processManager: ProcessManager) {
    super();
  }

  async run(passedParam: string[]): Promise<void> {
    const action = passedParam[0];

    switch (action) {
      case 'dev':
        await this.setupDevWorkspace();
        break;
      case 'chef':
        await this.setupChefWorkspace();
        break;
      default:
        logger.error('Unknown workspace action. Try "dev" or "chef".');
    }
  }

  private async setupDevWorkspace() {
    logger.warn('🚀 Workspace orchestration is currently disabled (Windows Agent removed).');
  }

  private async setupChefWorkspace() {
    logger.warn('👨‍🍳 Chef workspace orchestration is currently disabled (Windows Agent removed).');
  }
}
