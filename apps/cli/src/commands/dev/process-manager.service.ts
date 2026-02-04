import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import treeKill from 'tree-kill';
import { localConfig } from '@sous/config';
import { EventEmitter } from 'events';

export type ProcessStatus = 'stopped' | 'starting' | 'running' | 'error' | 'restarting';

export interface ManagedLog {
  id: string;
  name: string;
  message: string;
  timestamp: Date;
  level: 'info' | 'error' | 'warn';
}

export interface ManagedProcess {
  id: string;
  name: string;
  group: 'core' | 'native' | 'infra';
  status: ProcessStatus;
  port?: number;
  logs: ManagedLog[];
  child?: ChildProcess;
  autoStart?: boolean;
  timeout?: NodeJS.Timeout;
}

@Injectable()
export class ProcessManager extends EventEmitter implements OnModuleDestroy {
  private processes: Map<string, ManagedProcess> = new Map();
  private godViewLogs: ManagedLog[] = [];

  constructor() {
    super();
    this.initProcesses();
  }

  async onModuleDestroy() {
    await this.stopAll();
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

  getGodViewLogs() {
    return this.godViewLogs;
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

    const child = spawn('pnpm', ['--filter', `@sous/${id}`, 'run', 'dev'], {
      shell: true,
      env: { ...process.env, PORT: proc.port?.toString() },
    });

    proc.child = child;

    child.stdout?.on('data', (data) => {
      this.addLog(id, data.toString(), 'info');
    });

    child.stderr?.on('data', (data) => {
      this.addLog(id, data.toString(), 'error');
    });

    child.on('exit', (code) => {
      if (proc.timeout) clearTimeout(proc.timeout);
      proc.status = code === 0 ? 'stopped' : 'error';
      proc.child = undefined;
      this.emit('update');
    });

    // Simulated health check
    proc.timeout = setTimeout(() => {
      if (proc.status === 'starting') {
        proc.status = 'running';
        this.emit('update');
      }
    }, 3000);
  }

  async stopProcess(id: string) {
    const proc = this.processes.get(id);
    if (!proc) return;
    
    if (proc.timeout) clearTimeout(proc.timeout);

    if (!proc.child || !proc.child.pid) {
        proc.status = 'stopped';
        this.emit('update');
        return;
    }

    return new Promise<void>((resolve) => {
      treeKill(proc.child!.pid!, 'SIGKILL', () => {
        proc.status = 'stopped';
        proc.child = undefined;
        this.emit('update');
        resolve();
      });
    });
  }

  async stopAll() {
    const procs = this.getProcesses();
    await Promise.all(procs.map(p => this.stopProcess(p.id)));
  }

  async restartProcess(id: string) {
    await this.stopProcess(id);
    await this.startProcess(id);
  }

  private addLog(id: string, message: string, level: 'info' | 'error' | 'warn') {
    const proc = this.processes.get(id);
    if (!proc) return;

    const cleanMessage = message.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').trim();
    if (!cleanMessage) return;

    const logEntry: ManagedLog = {
      id,
      name: proc.name,
      message: cleanMessage,
      timestamp: new Date(),
      level,
    };

    proc.logs.push(logEntry);
    if (proc.logs.length > 500) proc.logs.shift();

    this.godViewLogs.push(logEntry);
    if (this.godViewLogs.length > 1000) this.godViewLogs.shift();

    this.emit('logs', logEntry);
    this.emit('update');
  }
}