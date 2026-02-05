import Database from '@tauri-apps/plugin-sql';

export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

export class NativeBridge {
  private db: any = null;
  private isNative: boolean = false;

  constructor() {
    this.isNative = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;
  }

  async init() {
    if (this.isNative) {
      try {
        this.db = await Database.load('sqlite:sous_tools.db');
        await this.db.execute(`
          CREATE TABLE IF NOT EXISTS offline_actions (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            payload TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            retryCount INTEGER DEFAULT 0
          )
        `);
      } catch (error) {
        console.error('Failed to initialize native SQLite:', error);
      }
    }
  }

  async queueAction(type: string, payload: any) {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    if (this.isNative && this.db) {
      await this.db.execute(
        'INSERT INTO offline_actions (id, type, payload, timestamp) VALUES (?, ?, ?, ?)',
        [action.id, action.type, JSON.stringify(action.payload), action.timestamp]
      );
    } else {
      // Web Fallback: localStorage
      const queue = JSON.parse(localStorage.getItem('sous_offline_queue') || '[]');
      queue.push(action);
      localStorage.setItem('sous_offline_queue', JSON.stringify(queue));
    }

    return action.id;
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    if (this.isNative && this.db) {
      const results = await this.db.select('SELECT * FROM offline_actions ORDER BY timestamp ASC');
      return results.map((r: any) => ({
        ...r,
        payload: JSON.parse(r.payload),
      }));
    } else {
      return JSON.parse(localStorage.getItem('sous_offline_queue') || '[]');
    }
  }

  async completeAction(id: string) {
    if (this.isNative && this.db) {
      await this.db.execute('DELETE FROM offline_actions WHERE id = ?', [id]);
    } else {
      const queue = JSON.parse(localStorage.getItem('sous_offline_queue') || '[]');
      const filtered = queue.filter((a: any) => a.id !== id);
      localStorage.setItem('sous_offline_queue', JSON.stringify(filtered));
    }
  }
}

export const bridge = new NativeBridge();