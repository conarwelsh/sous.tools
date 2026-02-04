import { invoke } from '@tauri-apps/api/core';

export interface SystemMetrics {
  cpu_usage: number;
  memory_used: number;
  memory_total: number;
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  return await invoke('plugin:sous-bridge|get_system_metrics');
}
