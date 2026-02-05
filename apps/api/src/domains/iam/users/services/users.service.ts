import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../core/database/database.service.js';
import { users } from '../../../core/database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DatabaseService) {}

  async findByEmail(email: string) {
    const result = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0];
  }

  async findById(id: string) {
    const result = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0];
  }

  async create(data: typeof users.$inferInsert) {
    const result = await this.dbService.db
      .insert(users)
      .values(data)
      .returning();

    return result[0];
  }
}
