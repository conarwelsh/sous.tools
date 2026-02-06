import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../../domains/core/database/database.service.js';
import { users, organizations } from '../../../domains/core/database/schema.js';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { logger } from '@sous/logger';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      orgId: user.organizationId, 
      role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: { email: string; passwordHash: string; firstName: string; lastName: string; organizationName: string }) {
    return await this.dbService.db.transaction(async (tx) => {
      // 1. Create Org
      const [org] = await tx.insert(organizations).values({
        name: data.organizationName,
        slug: data.organizationName.toLowerCase().replace(/\s+/g, '-'),
      }).returning();

      // 2. Hash Password
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(data.passwordHash, salt);

      // 3. Create User
      const [user] = await tx.insert(users).values({
        email: data.email,
        passwordHash: hash,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationId: org.id,
        role: 'admin',
      }).returning();

      return user;
    });
  }
}