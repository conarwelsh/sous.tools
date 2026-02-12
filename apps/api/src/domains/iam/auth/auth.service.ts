import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../../domains/core/database/database.service.js';
import {
  users,
  organizations,
  locations,
} from '../../../domains/core/database/schema.js';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { logger } from '@sous/logger';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async seedSystem() {
    console.log('🌱 Seeding IAM System & Admin Context...');
    console.log('DEBUG: AuthService dbService:', !!this.dbService);

    // 1. System Organization (for templates/global data)
    console.log('DEBUG: Inserting System Org...');
    await this.dbService.db
      .insert(organizations)
      .values({ name: 'System', slug: 'system' })
      .onConflictDoNothing();
    console.log('DEBUG: System Org inserted.');

    // 2. Initial Superadmin Organization
    console.log('DEBUG: Inserting Chef Conar Org...');
    const [org] = await this.dbService.db
      .insert(organizations)
      .values({ name: 'Chef Conar', slug: 'chef-conar' })
      .onConflictDoUpdate({
        target: organizations.slug,
        set: { name: 'Chef Conar' },
      })
      .returning();
    console.log('DEBUG: Chef Conar Org inserted:', org.id);

    // 3. Initial Superadmin User
    console.log('DEBUG: Hashing password...');
    const passwordHash = await bcrypt.hash('password', 10);
    console.log('DEBUG: Password hashed.');

    console.log('DEBUG: Inserting Superadmin User...');
    await this.dbService.db
      .insert(users)
      .values({
        email: 'conar@dtown.cafe',
        firstName: 'Conar',
        lastName: 'Welsh',
        passwordHash,
        organizationId: org.id,
        role: 'superadmin',
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          firstName: 'Conar',
          lastName: 'Welsh',
          role: 'superadmin',
          organizationId: org.id,
        },
      });
    console.log('DEBUG: Superadmin User inserted.');

    // 4. Initial Location
    console.log('DEBUG: Inserting Initial Location...');
    await this.dbService.db
      .insert(locations)
      .values({
        organizationId: org.id,
        name: 'Dtown Café',
      })
      .onConflictDoNothing();
    console.log('DEBUG: Initial Location inserted.');

    return org.id;
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
      })
      .onConflictDoNothing();
  }

  async getProfile(userId: string) {
    return await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        organization: true,
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

  async validateGoogleUser(profile: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }) {
    // 1. Try to find by googleId
    let user = await this.dbService.db.query.users.findFirst({
      where: eq(users.googleId, profile.id),
    });

    // 2. If not found, try to find by email
    if (!user) {
      user = await this.dbService.db.query.users.findFirst({
        where: eq(users.email, profile.email),
      });

      // 3. Link googleId to existing user if email matches
      if (user) {
        await this.dbService.db
          .update(users)
          .set({ googleId: profile.id, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
    }

    // 4. If still no user, we could potentially create one (Registration via Google)
    // For now, we only link or allow login for existing users to keep it controlled
    if (!user) {
      throw new UnauthorizedException(
        'Please register an account before linking with Google.',
      );
    }

    return user;
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
    const payload = {
      email: user.email,
      sub: user.id,
      orgId: user.organizationId,
      role: user.role,
      jti: crypto.randomUUID(),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }) {
    return await this.dbService.db.transaction(async (tx) => {
      // 1. Create Org
      const [org] = await tx
        .insert(organizations)
        .values({
          name: data.organizationName,
          slug: data.organizationName.toLowerCase().replace(/\s+/g, '-'),
        })
        .returning();

      // 2. Hash Password
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(data.passwordHash, salt);

      // 3. Create User
      const [user] = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash: hash,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationId: org.id,
          role: 'admin',
        })
        .returning();

      return user;
    });
  }
}
