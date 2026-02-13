import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../domains/core/database/database.service.js';
import { MailService } from '../../../domains/core/mail/mail.service.js';
import { invitations, organizations, users } from '../../../domains/core/database/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { config } from '@sous/config';
import { logger } from '@sous/logger';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly mailService: MailService,
  ) {}

  async createInvitation(data: {
    email: string;
    organizationId: string;
    role: 'user' | 'admin' | 'superadmin';
    invitedById: string;
  }) {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    return await this.dbService.db.transaction(async (tx) => {
      const [org] = await tx
        .select()
        .from(organizations)
        .where(eq(organizations.id, data.organizationId));

      if (!org) throw new NotFoundException('Organization not found');

      const inviter = await tx.query.users.findFirst({
        where: eq(users.id, data.invitedById),
      });

      const [invite] = await tx
        .insert(invitations)
        .values({
          email: data.email,
          organizationId: data.organizationId,
          role: data.role,
          invitedById: data.invitedById,
          token,
          expiresAt,
        })
        .returning();

      const inviteLink = `${config.web.url}/register?token=${token}&email=${encodeURIComponent(data.email)}`;
      
      await this.mailService.sendInvitationEmail(
        data.email, 
        org.name, 
        inviteLink, 
        inviter?.firstName || 'A team member',
        data.role
      );

      return invite;
    });
  }

  async validateInvitation(token: string) {
    const invite = await this.dbService.db.query.invitations.findFirst({
      where: and(
        eq(invitations.token, token),
        gt(invitations.expiresAt, new Date())
      ),
      with: {
        organization: true,
      }
    });

    if (!invite) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    if (invite.acceptedAt) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    return invite;
  }

  async markAsAccepted(token: string) {
    await this.dbService.db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.token, token));
  }

  async listInvitations(organizationId: string) {
    return await this.dbService.db.query.invitations.findMany({
      where: eq(invitations.organizationId, organizationId),
      orderBy: (inv, { desc }) => [desc(inv.createdAt)],
      with: {
        invitedBy: true,
      }
    });
  }

  async revokeInvitation(id: string, organizationId: string) {
    await this.dbService.db
      .delete(invitations)
      .where(and(
        eq(invitations.id, id),
        eq(invitations.organizationId, organizationId)
      ));
    
    return { success: true };
  }
}
