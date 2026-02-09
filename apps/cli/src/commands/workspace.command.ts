import { Command, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import { ProcessManager } from './dev/process-manager.service.js';

interface AgentResponse {
  status: string;
  message?: string;
  [key: string]: any;
}

@Command({
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

  private async callAgent(
    command: string,
    payload: any,
  ): Promise<AgentResponse> {
    // We'll use the processManager's existing logic once we expose it,
    // or just call it directly here for now.
    try {
      const response = await fetch('http://172.18.16.1:4040', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, ...payload }),
      });
      return (await response.json()) as AgentResponse;
    } catch (e) {
      return { status: 'error', message: 'Windows Agent not reachable' };
    }
  }

  private async setupDevWorkspace() {
    logger.info('🚀 Orchestrating 3-Monitor Development Layout...');

    // MONITOR COORDINATES (Assuming Center is 0,0)
    const LEFT_X = -1920;
    const CENTER_X = 0;
    const RIGHT_X = 3840;

    // 1. CHROME PROFILES
    // Conar (Programming) -> Center Right (Localhosts)
    await this.callAgent('launch-browser', {
      profile: 'Default', // Programming profile
      urls: ['http://localhost:3000', 'http://localhost:4000/docs'],
    });

    // Conar (Developer - sous.tools) -> Center Left (Infra Tools)
    await this.callAgent('launch-browser', {
      profile: 'Developer',
      theme: 'packages/ui/assets/chrome-theme',
      urls: [
        'https://github.com',
        'https://vercel.com',
        'https://supabase.com',
        'https://render.com',
        'https://infisical.com',
      ],
    });

    // Conar (Chef) -> Left Monitor
    await this.callAgent('launch-browser', {
      profile: 'Chef',
      urls: ['https://app.squareup.com', 'http://localhost:1080'],
    });

    // 2. APPLICATIONS
    // VSCode -> Center Middle
    // (Wait for apps to open then position)
    await new Promise((r) => setTimeout(r, 2000));

    // POSITIONING
    // VSCode (Center of 48" Ultrawide)
    await this.callAgent('position-window', {
      title: 'Visual Studio Code',
      x: CENTER_X + 960,
      y: 0,
      width: 1920,
      height: 1080,
    });

    // Localhost Chrome (Right of 48" Ultrawide)
    await this.callAgent('position-window', {
      title: 'web.sous.localhost',
      x: CENTER_X + 2880,
      y: 0,
      width: 960,
      height: 1080,
    });

    // Infra Chrome (Left of 48" Ultrawide)
    await this.callAgent('position-window', {
      title: 'GitHub',
      x: CENTER_X,
      y: 0,
      width: 960,
      height: 1080,
    });

    // Spotify -> Vertical Screen (assume top half)
    await this.callAgent('position-window', {
      title: 'Spotify',
      x: RIGHT_X,
      y: 0,
      width: 1440,
      height: 1200,
    });

    logger.info('✨ Workspace synchronized.');
  }

  private async setupChefWorkspace() {
    logger.info('👨‍🍳 Setting up Chef Workspace...');
    await this.callAgent('launch-browser', {
      profile: 'Chef', // Assuming a Chrome profile named Chef
      urls: ['http://localhost:3000/signage/default'],
    });
  }
}
