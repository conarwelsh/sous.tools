import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { DatabaseService } from '../../core/database/database.service.js';
import { users } from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';

@Controller('iam/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly dbService: DatabaseService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMembers(@Req() req: any) {
    return this.dbService.db.query.users.findMany({
      where: eq(users.organizationId, req.user.orgId),
      orderBy: (u, { asc }) => [asc(u.firstName)],
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/role')
  async updateRole(
    @Req() req: any,
    @Param('id') id: string,
    @Body('role') role: 'user' | 'admin',
  ) {
    // Only admins can change roles
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      throw new ForbiddenException('Only administrators can manage roles');
    }

    // Don't allow changing your own role to prevent lockout
    if (req.user.sub === id) {
      throw new ForbiddenException('You cannot change your own role');
    }

    await this.dbService.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(and(eq(users.id, id), eq(users.organizationId, req.user.orgId)));

    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeMember(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      throw new ForbiddenException('Only administrators can remove members');
    }

    if (req.user.sub === id) {
      throw new ForbiddenException('You cannot remove yourself');
    }

    await this.dbService.db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.organizationId, req.user.orgId)));

    return { success: true };
  }
}
