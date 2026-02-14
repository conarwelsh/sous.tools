import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../../core/database/database.service.js';
import { oauthClients, oauthAuthorizationCodes } from '../oauth.schema.js';
import { users } from '../../users/users.schema.js';
import { eq, and } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { logger } from '@sous/logger';
import * as crypto from 'crypto';

@Injectable()
export class OAuthService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async getClient(clientId: string) {
    const client = await this.dbService.db.query.oauthClients.findFirst({
      where: eq(oauthClients.clientId, clientId),
    });
    if (!client) throw new UnauthorizedException('Invalid client ID');
    return client;
  }

  async createAuthorizationCode(
    clientId: string,
    userId: string,
    scopes: string[],
  ) {
    const code = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 min expiration

    const client = await this.getClient(clientId);

    await this.dbService.db.insert(oauthAuthorizationCodes).values({
      clientId: client.id,
      userId,
      code,
      scopes,
      expiresAt,
    });

    return code;
  }

  async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
  ) {
    const client = await this.getClient(clientId);
    if (client.clientSecret !== clientSecret) {
      throw new UnauthorizedException('Invalid client secret');
    }

    const authCode =
      await this.dbService.db.query.oauthAuthorizationCodes.findFirst({
        where: and(
          eq(oauthAuthorizationCodes.code, code),
          eq(oauthAuthorizationCodes.clientId, client.id),
        ),
      });

    if (!authCode || authCode.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired authorization code');
    }

    // Generate Token
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.id, (authCode as any).userId),
    });

    if (!user) throw new BadRequestException('User not found');

    const payload = {
      sub: user.id,
      orgId: user.organizationId,
      scopes: authCode.scopes,
      aud: '3rd-party',
      client_id: clientId,
    };

    // Delete code after use
    await this.dbService.db
      .delete(oauthAuthorizationCodes)
      .where(eq(oauthAuthorizationCodes.id, authCode.id));

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expires_in: 86400,
      scope: (authCode.scopes as string[]).join(' '),
    };
  }

  async registerClient(
    organizationId: string,
    name: string,
    redirectUris: string[],
  ) {
    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');

    const [client] = await this.dbService.db
      .insert(oauthClients)
      .values({
        organizationId,
        name,
        clientId,
        clientSecret,
        redirectUris,
      })
      .returning();

    return client;
  }

  async getClientsForOrganization(organizationId: string) {
    return this.dbService.db.query.oauthClients.findMany({
      where: eq(oauthClients.organizationId, organizationId),
    });
  }

  async rotateSecret(clientId: string, organizationId: string) {
    const client = await this.getClient(clientId);
    if (client.organizationId !== organizationId)
      throw new UnauthorizedException();

    const newSecret = crypto.randomBytes(32).toString('hex');
    await this.dbService.db
      .update(oauthClients)
      .set({
        clientSecret: newSecret,
        updatedAt: new Date(),
      })
      .where(eq(oauthClients.id, client.id));

    return { clientSecret: newSecret };
  }

  async deleteClient(clientId: string, organizationId: string) {
    const client = await this.getClient(clientId);
    if (client.organizationId !== organizationId)
      throw new UnauthorizedException();

    await this.dbService.db
      .delete(oauthClients)
      .where(eq(oauthClients.id, client.id));
    return { success: true };
  }
}
