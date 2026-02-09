/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { UseInterceptors } from '@nestjs/common';
import { RealtimeThrottlingInterceptor } from './interceptors/throttling.interceptor.js';
import { DatabaseService } from '../core/database/database.service.js';
import { displays, displayAssignments } from '../core/database/schema.js';
import { eq } from 'drizzle-orm';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseInterceptors(RealtimeThrottlingInterceptor)
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly dbService: DatabaseService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth;

      // 1. Hardware Connection
      if (auth.hardwareId) {
        client.data.hardwareId = auth.hardwareId;
        await client.join(`hardware:${auth.hardwareId}`);
        logger.info(`📟 Hardware node connected: ${auth.hardwareId}`);

        // Push current assignment if exists
        await this.pushCurrentAssignment(auth.hardwareId);
        return;
      }

      // 2. User Connection
      const token = auth.token || client.handshake.headers.authorization;
      if (!token) {
        logger.warn(`Client connected without token: ${client.id}`);
        return;
      }

      const payload = await this.jwtService.verifyAsync(
        token.replace('Bearer ', ''),
      );
      client.data.user = payload;

      if (payload.orgId) {
        await client.join(`org:${payload.orgId}`);
        logger.info(`👤 User ${client.id} joined room org:${payload.orgId}`);
      }
    } catch (e) {
      logger.error(`Connection auth failed for ${client.id}: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    logger.info(`Client disconnected: ${client.id}`);
  }

  emitToOrg(orgId: string, event: string, data: any) {
    this.server.to(`org:${orgId}`).emit(event, data);
  }

  emitToHardware(hardwareId: string, event: string, data: any) {
    this.server.to(`hardware:${hardwareId}`).emit(event, data);
  }

  private async pushCurrentAssignment(hardwareId: string) {
    // 1. Find display for this hardware

    const display = await this.dbService.db.query.displays.findFirst({
      where: eq(displays.hardwareId, hardwareId),
    });

    if (!display) return;

    // 2. Find active assignment with template

    const assignment =
      (await this.dbService.db.query.displayAssignments.findFirst({
        where: eq(displayAssignments.displayId, display.id),

        orderBy: (assignments: any, { desc }: any) =>
          [desc(assignments.createdAt)] as any,
        with: {
          template: true,
        },
      })) as any;

    if (assignment) {
      this.emitToHardware(hardwareId, 'presentation:update', {
        structure: JSON.parse(assignment.template.structure),
        content: JSON.parse(assignment.content),
      });
    }
  }
}
