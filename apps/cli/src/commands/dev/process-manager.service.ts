import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { exec } from 'child_process';
import { logger } from '@sous/logger';
import { EventEmitter } from 'events';
import { promisify } from 'util';
import pm2 from 'pm2';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';

const execAsync = promisify(exec);

export type ProcessStatus =
  | 'running'
  | 'starting'
  | 'stopped'
  | 'error'
  | 'building';

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
  type: 'pm2' | 'docker';
  status: ProcessStatus;
  logs: ManagedLog[];
  namespace?: string;
}

@Injectable()
export class ProcessManager
  extends EventEmitter
  implements OnModuleDestroy, OnModuleInit
{
  private processes: Map<string, ManagedProcess> = new Map();
  private combinedLogs: ManagedLog[] = [];
  private isPm2Connected = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private logTailers: Map<string, any> = new Map();

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.connectPm2();
    this.startPolling();
  }

  async onModuleDestroy() {
    this.stopPolling();
    if (this.isPm2Connected) {
      pm2.disconnect();
    }
  }

  private async connectPm2(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          logger.error(`❌ PM2 Connection failed: ${err.message}`);
          reject(err);
        } else {
          this.isPm2Connected = true;
          resolve();
        }
      });
    });
  }

  private startPolling() {
    this.pollInterval = setInterval(() => {
      void this.syncStatus();
    }, 2000);
  }

  private stopPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  private async syncStatus() {
    if (!this.isPm2Connected) return;

    pm2.list((err, list) => {
      if (err) return;

      const currentIds = new Set<string>();
      let updated = false;

      for (const p of list) {
        const id = p.name || 'unknown';
        currentIds.add(id);

        const pm2Status = p.pm2_env?.status;
        let status: ProcessStatus = 'stopped';
        
        if (pm2Status === 'online') status = 'running';
        else if (pm2Status === 'launching') status = 'starting';
        else if (pm2Status === 'errored') status = 'error';

        if (!this.processes.has(id)) {
          this.processes.set(id, {
            id,
            name: id.replace('sous-', '').toUpperCase(),
            type: id.startsWith('sous-db') || id.startsWith('sous-redis') ? 'docker' : 'pm2',
            status,
            logs: [],
            namespace: (p.pm2_env as any)?.namespace
          });
          this.setupLogTailer(id, (p.pm2_env as any)?.pm_out_log_path, (p.pm2_env as any)?.pm_err_log_path);
          updated = true;
        } else {
          const proc = this.processes.get(id)!;
          if (proc.status !== status) {
            proc.status = status;
            updated = true;
          }
        }
      }

      // Cleanup removed processes
      for (const id of this.processes.keys()) {
        if (!currentIds.has(id)) {
          this.processes.delete(id);
          updated = true;
        }
      }

      if (updated) this.emit('update');
    });
  }

  private setupLogTailer(id: string, outPath?: string, errPath?: string) {
    if (this.logTailers.has(id)) return;
    if (!outPath) return;

    // Use a simple fs.watchFile or tail -f approach
    // For performance and to prevent flickering, we'll use a readable stream
    const tailFile = (filePath: string, level: 'info' | 'error') => {
      if (!fs.existsSync(filePath)) return;
      
      // Initial read of last 50 lines
      const stats = fs.statSync(filePath);
      const start = Math.max(0, stats.size - 5000);
      const stream = fs.createReadStream(filePath, { start });
      
      stream.on('data', (data) => {
        this.addLog(id, data.toString(), level);
      });

      // Watch for new data
      fs.watch(filePath, (event) => {
        if (event === 'change') {
          const newStats = fs.statSync(filePath);
          const newSize = newStats.size;
          const oldSize = (this.logTailers.get(`${id}-${level}`) || { size: start }).size;
          
          if (newSize > oldSize) {
            const newStream = fs.createReadStream(filePath, { start: oldSize, end: newSize });
            newStream.on('data', (data) => {
              this.addLog(id, data.toString(), level);
            });
            this.logTailers.set(`${id}-${level}`, { size: newSize });
          }
        }
      });

      this.logTailers.set(`${id}-${level}`, { size: stats.size });
    };

    tailFile(outPath, 'info');
    if (errPath && errPath !== outPath) tailFile(errPath, 'error');
  }

  private addLog(id: string, message: string, level: 'info' | 'error') {
    const proc = this.processes.get(id);
    if (!proc) return;

    const lines = message.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const log: ManagedLog = {
        id,
        name: proc.name,
        message: line.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, ''), // Strip ANSI
        timestamp: new Date(),
        level
      };

      proc.logs.push(log);
      if (proc.logs.length > 1000) proc.logs.shift();
      
      this.combinedLogs.push(log);
      if (this.combinedLogs.length > 2000) this.combinedLogs.shift();
    }
    this.emit('update');
  }

  getProcesses() {
    return Array.from(this.processes.values());
  }

  getCombinedLogs() {
    return this.combinedLogs;
  }

  async startProcess(id: string) {
    return new Promise<void>((resolve) => {
      pm2.start(id, (err) => {
        if (err) logger.error(`Failed to start ${id}: ${err.message}`);
        resolve();
      });
    });
  }

  async stopProcess(id: string) {
    return new Promise<void>((resolve) => {
      pm2.stop(id, (err) => {
        if (err) logger.error(`Failed to stop ${id}: ${err.message}`);
        resolve();
      });
    });
  }

  async stopAll() {
    return new Promise<void>((resolve) => {
      (pm2 as any).kill(() => {
        resolve();
      });
    });
  }

  async restartProcess(id: string) {
    return new Promise<void>((resolve) => {
      pm2.restart(id, (err) => {
        if (err) logger.error(`Failed to restart ${id}: ${err.message}`);
        resolve();
      });
    });
  }

  async autoStartCore() {
    // 2.0 Approach: Just ensure docker is up, then PM2 takes over via ecosystem
    try {
      await execAsync('docker compose up -d');
      // PM2 should already be running these if started via 'pm2 start ecosystem.config.js'
      // But we can trigger a start all if needed
      return new Promise<void>((resolve) => {
        pm2.start('ecosystem.config.js', (err) => {
          resolve();
        });
      });
    } catch (e: any) {
      logger.error(`Core startup failed: ${e.message}`);
    }
  }

  clearLogs(id?: string) {
    if (!id || id === 'combined') this.combinedLogs = [];
    else {
      const proc = this.processes.get(id);
      if (proc) proc.logs = [];
    }
    this.emit('update');
  }
}
