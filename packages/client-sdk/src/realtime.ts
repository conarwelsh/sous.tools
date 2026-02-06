import { io, Socket } from 'socket.io-client';

export interface RealtimeOptions {
  url: string;
  token?: string;
  hardwareId?: string;
}

export class RealtimeClient {
  public socket: Socket;

  constructor(options: RealtimeOptions) {
    this.socket = io(options.url, {
      auth: {
        token: options.token,
        hardwareId: options.hardwareId,
      },
    });
  }

  public on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  public emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  public disconnect() {
    this.socket.disconnect();
  }
}
