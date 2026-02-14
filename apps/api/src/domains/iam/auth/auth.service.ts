import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import { DatabaseService } from '../../core/database/database.service.js';
import { MailService } from '../../core/mail/mail.service.js';
import {
  users,
  organizations,
  locations,
  invitations,
  passwordResetTokens,
  plans,
} from '../../core/database/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { logger } from '@sous/logger';
import { config } from '@sous/config';
import { PlanType, FeatureScope, MetricKey } from '@sous/features/constants/plans';

@Injectable()
export class AuthService {
    constructor(
      @Inject(DatabaseService) private readonly dbService: DatabaseService,
      private readonly jwtService: JwtService,
      @Optional() private readonly mailService?: MailService,
    ) {
  }

  async forgotPassword(email: string) {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Return success even if user not found for security (prevent email enumeration)
      return { success: true };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    await this.dbService.db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const resetLink = `${config.web.url}/reset-password?token=${token}`;
    if (this.mailService) {
      await this.mailService.sendPasswordResetEmail(user.email, resetLink);
    }

    return { success: true };
  }

  async resetPassword(data: { token: string; newPass: string }) {
    const resetToken =
      await this.dbService.db.query.passwordResetTokens.findFirst({
        where: and(
          eq(passwordResetTokens.token, data.token),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(data.newPass, salt);

    await this.dbService.db.transaction(async (tx) => {
      // 1. Update Password
      await tx
        .update(users)
        .set({ passwordHash: hash, updatedAt: new Date() })
        .where(eq(users.id, resetToken.userId));

      // 2. Revoke Token
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));
    });

    return { success: true };
  }

  async seedSystem() {
    logger.info('🌱 Seeding IAM System & Admin Context...');

    // 1. Core Plans
    try {
      await this.dbService.db
        .insert(plans)
        .values([
          {
            name: 'Commis',
            slug: PlanType.COMMIS,
            baseScopes: [
              FeatureScope.CULINARY_RECIPE_CREATE,
              FeatureScope.CULINARY_COOK_MODE,
            ],
            limits: { 
              [MetricKey.MAX_RECIPES]: 10,
              [MetricKey.MAX_USERS]: 2,
            },
          },
          {
            name: 'Chef de Partie',
            slug: PlanType.CHEF_DE_PARTIE,
            baseScopes: [
              FeatureScope.CULINARY_RECIPE_CREATE,
              FeatureScope.CULINARY_RECIPE_AI_PARSE,
              FeatureScope.CULINARY_COOK_MODE,
              FeatureScope.PROCURE_INVOICE_CREATE,
              FeatureScope.PROCURE_INVOICE_VIEW,
            ],
            limits: {
              [MetricKey.MAX_RECIPES]: 100,
              [MetricKey.MAX_USERS]: 10,
            },
          },
          {
            name: 'Executive Chef',
            slug: PlanType.EXECUTIVE_CHEF,
            baseScopes: Object.values(FeatureScope),
            limits: {
              [MetricKey.MAX_RECIPES]: 10000,
              [MetricKey.MAX_USERS]: 100,
            },
          },
        ])
        .onConflictDoNothing();
      logger.info('  └─ Plans ensured');
    } catch (e) {
      logger.error('  ❌ Failed to seed Plans', e);
    }

    // 2. System Organization (for templates/global data)
    try {
      await this.dbService.db
        .insert(organizations)
        .values({ name: 'System', slug: 'system' })
        .onConflictDoNothing();
      logger.info('  └─ System Org ensured');
    } catch (e) {
      logger.error('  ❌ Failed to seed System Org', e);
    }

    // 2. Initial Superadmin Organization
    let orgId: string;
    try {
      const result = await this.dbService.db
        .insert(organizations)
        .values({ name: 'Chef Conar', slug: 'chef-conar' })
        .onConflictDoUpdate({
          target: organizations.slug,
          set: { name: 'Chef Conar' },
        })
        .returning();

      if (result.length > 0) {
        orgId = result[0].id;
      } else {
        // Fallback if returning() is empty (should not happen with onConflictDoUpdate)
        const existing = await this.dbService.db.query.organizations.findFirst({
          where: eq(organizations.slug, 'chef-conar'),
        });
        if (!existing)
          throw new Error('Failed to create or find Chef Conar organization');
        orgId = existing.id;
      }
      logger.info(`  └─ Superadmin Org ensured: ${orgId}`);
    } catch (e) {
      logger.error('  ❌ Failed to seed Superadmin Org', e);
      throw e;
    }

    // 3. Initial Superadmin User
    try {
      const passwordHash = await bcrypt.hash('password', 10);
      await this.dbService.db
        .insert(users)
        .values({
          email: 'conar@dtown.cafe',
          firstName: 'Conar',
          lastName: 'Welsh',
          passwordHash,
          organizationId: orgId,
          role: 'superadmin',
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            firstName: 'Conar',
            lastName: 'Welsh',
            role: 'superadmin',
            organizationId: orgId,
          },
        });
      logger.info('  └─ Superadmin User ensured');
    } catch (e) {
      logger.error('  ❌ Failed to seed Superadmin User', e);
      throw e;
    }

    // 4. Initial Location
    try {
      await this.dbService.db
        .insert(locations)
        .values({
          organizationId: orgId,
          name: 'Dtown Café',
        })
        .onConflictDoNothing();
      logger.info('  └─ Initial Location ensured');
    } catch (e) {
      logger.error('  ❌ Failed to seed Initial Location', e);
    }

    return orgId;
  }

  async seedSample() {
    logger.info('  └─ Seeding IAM Sample User...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // Ensure org exists
    const [org] = await this.dbService.db
      .insert(organizations)
      .values({
        name: 'Sample Kitchen',
        slug: 'sample-kitchen',
      })
      .onConflictDoNothing()
      .returning();

    const orgId =
      org?.id ||
      (
        await this.dbService.db.query.organizations.findFirst({
          where: eq(organizations.slug, 'sample-kitchen'),
        })
      )?.id;

    if (!orgId) return;

    await this.dbService.db
      .insert(users)
      .values({
        email: 'chef@sous.tools',
        firstName: 'Sample',
        lastName: 'Chef',
        passwordHash,
        organizationId: orgId,
        role: 'admin',
        pin: '1234',
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          pin: '1234',
        }
      });
  }

  async getProfile(userId: string) {
    // Basic UUID validation to prevent DB crashes
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return null;
    }

    return await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        organization: {
          with: {
            plan: true,
          },
        },
      },
    });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async validatePinUser(pin: string): Promise<any> {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.pin, pin),
    });

    if (user) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateSocialUser(profile: {
    provider: 'google' | 'github' | 'facebook';
    providerId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }) {
    // 1. Try to find by providerId
    let condition;
    if (profile.provider === 'google')
      condition = eq(users.googleId, profile.providerId);
    else if (profile.provider === 'github')
      condition = eq(users.githubId, profile.providerId);
    else if (profile.provider === 'facebook')
      condition = eq(users.facebookId, profile.providerId);

    let [user] = condition
      ? await this.dbService.db.select().from(users).where(condition).limit(1)
      : [null];

    // 2. If not found, try to find by email
    if (!user) {
      [user] = await this.dbService.db
        .select()
        .from(users)
        .where(eq(users.email, profile.email))
        .limit(1);

      // 3. Link providerId to existing user if email matches
      if (user) {
        const updateData: any = { updatedAt: new Date() };
        if (profile.provider === 'google')
          updateData.googleId = profile.providerId;
        if (profile.provider === 'github')
          updateData.githubId = profile.providerId;
        if (profile.provider === 'facebook')
          updateData.facebookId = profile.providerId;

        await this.dbService.db
          .update(users)
          .set(updateData)
          .where(eq(users.id, user.id));
      }
    }

    if (!user) {
      throw new UnauthorizedException(
        `Please register an account before linking with ${profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1)}.`,
      );
    }

    return user;
  }

  async validateGoogleUser(profile: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }) {
    return this.validateSocialUser({
      provider: 'google',
      providerId: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  }

  async changePassword(
    userId: string,
    data: { currentPass: string; newPass: string },
  ) {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !(await bcrypt.compare(data.currentPass, user.passwordHash))) {
      throw new BadRequestException('Invalid current password');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(data.newPass, salt);

    await this.dbService.db
      .update(users)
      .set({ passwordHash: hash, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return { success: true };
  }

  async login(user: any) {
    const org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, user.organizationId),
    });

    const isPendingPayment = org?.planStatus === 'pending_payment';
    const scopes = isPendingPayment ? ['billing:setup'] : undefined;

    const payload = {
      email: user.email,
      sub: user.id,
      orgId: user.organizationId,
      role: user.role,
      scopes,
      jti: crypto.randomUUID(),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
    inviteToken?: string;
  }) {
    return await this.dbService.db.transaction(async (tx) => {
      let orgId: string;
      let role: 'user' | 'admin' | 'salesman' | 'superadmin' = 'admin';

      // 1. Handle Invitation Flow
      if (data.inviteToken) {
        const invite = await tx.query.invitations.findFirst({
          where: eq(invitations.token, data.inviteToken),
        });

        if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
          throw new BadRequestException('Invalid or expired invitation');
        }

        orgId = invite.organizationId;
        role = invite.role as any;

        // Mark invite as accepted
        await tx
          .update(invitations)
          .set({ acceptedAt: new Date() })
          .where(eq(invitations.id, invite.id));
      } else {
        // 2. Manual Registration (Create new Org)
        if (!data.organizationName) {
          throw new BadRequestException('Organization name is required');
        }

        const [org] = await tx
          .insert(organizations)
          .values({
            name: data.organizationName,
            slug: data.organizationName.toLowerCase().replace(/\s+/g, '-'),
            planStatus: 'pending_payment',
          })
          .returning();
        orgId = org.id;
      }

      // 3. Hash Password
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(data.password, salt);

      // 4. Create User
      const [user] = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash: hash,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationId: orgId,
          role,
        })
        .returning();

      // 5. Trigger Verification Email (Async via Queue)
      if (this.mailService) {
        const verificationLink = `${config.web.url}/verify-email?token=${crypto.randomBytes(32).toString('hex')}`;
        void this.mailService.sendVerificationEmail(user.email, user.firstName || 'Chef', verificationLink);
      }

      return user;
    });
  }
}
