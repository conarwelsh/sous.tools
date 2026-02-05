import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { logger } from '@sous/logger';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization;
      if (!token) {
        logger.warn(`Client connected without token: ${client.id}`);
        // client.disconnect(); // Strict mode would disconnect here
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(
        token.replace('Bearer ', ''),
      );
      client.data.user = payload;

      // Join Org Room
      if (payload.orgId) {
        await client.join(`org:${payload.orgId}`);
        logger.info(`Client ${client.id} joined room org:${payload.orgId}`);
      }
    } catch (e) {
      logger.error(`Connection auth failed for ${client.id}: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    logger.info(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, payload: any): string {
    return 'pong';
  }

  // Method to emit events to specific orgs or displays
  emitToOrg(orgId: string, event: string, data: any) {
    this.server.to(`org:${orgId}`).emit(event, data);
  }
}
