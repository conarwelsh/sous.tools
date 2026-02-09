import { Resolver, Query, ObjectType, Field, Int } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { count, eq } from 'drizzle-orm';
import { recipes, ingredients, invoices, devices } from '../database/schema.js';

@ObjectType()
class DashboardStats {
  @Field(() => Int)
  activeRecipes: number;

  @Field(() => Int)
  inventoryItems: number;

  @Field(() => Int)
  pendingInvoices: number;

  @Field(() => Int)
  connectedNodes: number;
}

@Resolver()
export class DashboardResolver {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {}

  @Query(() => DashboardStats)
  async dashboardStats() {
    const [recipeStats] = await this.dbService.db
      .select({ count: count() })
      .from(recipes);

    const [ingredientStats] = await this.dbService.db
      .select({ count: count() })
      .from(ingredients);

    const [invoiceStats] = await this.dbService.db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.status, 'pending'));

    const [deviceStats] = await this.dbService.db
      .select({ count: count() })
      .from(devices)
      .where(eq(devices.status, 'online'));

    return {
      activeRecipes: recipeStats?.count ?? 0,
      inventoryItems: ingredientStats?.count ?? 0,
      pendingInvoices: invoiceStats?.count ?? 0,
      connectedNodes: deviceStats?.count ?? 0,
    };
  }
}
