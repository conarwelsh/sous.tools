import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import treeKill from 'tree-kill';
import { localConfig } from '@sous/config';
import { EventEmitter } from 'events';

export type ProcessStatus = 'stopped' | 'starting' | 'running' | 'error' | 'restarting';

export interface ManagedProcess {
  id: string;
  name: string;
  group: 'core' | 'native' | 'infra';
  status: ProcessStatus;
  port?: number;
  logs: string[];
  child?: ChildProcess;
}

@Injectable()
export class ProcessManager extends EventEmitter {
  private processes: Map<string, ManagedProcess> = new Map();

  constructor() {
    super();
    this.initProcesses();
  }

  private initProcesses() {
    const apps = [
      { id: 'api', name: 'API', group: 'core', port: localConfig.api.port as number },
      { id: 'web', name: 'Web', group: 'core', port: localConfig.web.port as number },
      { id: 'docs', name: 'Docs', group: 'core', port: localConfig.docs.port as number },
      { id: 'native', name: 'Native', group: 'native', port: localConfig.native.port as number },
      { id: 'headless', name: 'Headless', group: 'native', port: localConfig.headless.port as number },
    ];

    for (const app of apps) {
      this.processes.set(app.id, {
        ...app,
        status: 'stopped',
        logs: [],
      } as ManagedProcess);
    }
  }

  getProcesses() {
    return Array.from(this.processes.values());
  }

  async startProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc || proc.status === 'running' || proc.status === 'starting') return;

    proc.status = 'starting';
    this.emit('update');

    // In a real implementation, we'd use the absolute pnpm path like dev-orchestrator
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

    // Mock success for now, real implementation would check port
    setTimeout(() => {
      if (proc.status === 'starting') {
        proc.status = 'running';
        this.emit('update');
      }
    }, 2000);
  }

  async stopProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc || !proc.child || !proc.child.pid) return;

    return new Promise<void>((resolve) => {
      treeKill(proc.child!.pid!, 'SIGTERM', () => {
        proc.status = 'stopped';
        proc.child = undefined;
        this.emit('update');
        resolve();
      });
    });
  }

  private addLog(id: string, message: string) {
    const proc = this.processes.get(id);
    if (!proc) return;

    proc.logs.push(message);
    if (proc.logs.length > 500) proc.logs.shift();
    this.emit('logs', { id, message });
  }
}
