import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import treeKill from 'tree-kill';
import { localConfig } from '@sous/config';
import { EventEmitter } from 'events';
import { logger } from '@sous/logger';

export type ProcessStatus = 'stopped' | 'starting' | 'running' | 'error' | 'restarting';

export interface ManagedProcess {
  id: string;
  name: string;
  group: 'core' | 'native' | 'infra';
  status: ProcessStatus;
  port?: number;
  logs: string[];
  child?: ChildProcess;
  autoStart?: boolean;
}

@Injectable()
export class ProcessManager extends EventEmitter {
  private processes: Map<string, ManagedProcess> = new Map();

  constructor() {
    super();
    this.initProcesses();
  }

  private initProcesses() {
    const apps: Partial<ManagedProcess>[] = [
      { id: 'api', name: 'API', group: 'core', port: localConfig.api.port as number, autoStart: true },
      { id: 'web', name: 'Web', group: 'core', port: localConfig.web.port as number, autoStart: true },
      { id: 'docs', name: 'Docs', group: 'core', port: localConfig.docs.port as number, autoStart: true },
      { id: 'native', name: 'Native App', group: 'native', port: localConfig.native.port as number },
      { id: 'native-headless', name: 'Signage (Headless)', group: 'native', port: localConfig.headless.port as number },
      { id: 'native-kds', name: 'KDS Terminal', group: 'native', port: localConfig.kds.port as number },
      { id: 'native-pos', name: 'POS Terminal', group: 'native', port: localConfig.pos.port as number },
      { id: 'wearos', name: 'Wear OS', group: 'native' },
    ];

    for (const app of apps) {
      this.processes.set(app.id!, {
        ...app,
        status: 'stopped',
        logs: [],
      } as ManagedProcess);
    }
  }

  getProcesses() {
    return Array.from(this.processes.values());
  }

  async autoStartCore() {
    const coreApps = this.getProcesses().filter(p => p.autoStart);
    for (const app of coreApps) {
      this.startProcess(app.id);
    }
  }

  async startProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc || proc.status === 'running' || proc.status === 'starting') return;

    proc.status = 'starting';
    this.emit('update');

    // We use absolute paths and pnpm from the root
    const child = spawn('pnpm', ['--filter', `@sous/${id}`, 'run', 'dev'], {
      shell: true,
      env: { ...process.env, PORT: proc.port?.toString() },
    });

    proc.child = child;

    child.stdout?.on('data', (data) => {
      this.addLog(id, data.toString());
    });

    child.stderr?.on('data', (data) => {
      this.addLog(id, `ERROR: ${data.toString()}`);
    });

    child.on('exit', (code) => {
      proc.status = code === 0 ? 'stopped' : 'error';
      proc.child = undefined;
      this.emit('update');
    });

    // Simple health check simulation - real world would probe the port
    setTimeout(() => {
      if (proc.status === 'starting') {
        proc.status = 'running';
        this.emit('update');
      }
    }, 3000);
  }

  async stopProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc) return;
    
    if (!proc.child || !proc.child.pid) {
        proc.status = 'stopped';
        this.emit('update');
        return;
    }

    return new Promise<void>((resolve) => {
      treeKill(proc.child!.pid!, 'SIGTERM', () => {
        proc.status = 'stopped';
        proc.child = undefined;
        this.emit('update');
        resolve();
      });
    });
  }

  async restartProcess(id: string) {
    await this.stopProcess(id);
    await this.startProcess(id);
  }

  private addLog(id: string, message: string) {
    const proc = this.processes.get(id);
    if (!proc) return;

    // Clean up terminal escape codes from sub-processes for cleaner TUI viewing
    const cleanMessage = message.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    
    proc.logs.push(cleanMessage);
    if (proc.logs.length > 500) proc.logs.shift();
    this.emit('logs', { id, message: cleanMessage });
    this.emit('update');
  }
}