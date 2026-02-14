import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  posOrders,
  posOrderProducts,
  posLedgers,
  financialTransactions,
} from '../pos.schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { PubSub } from 'graphql-subscriptions';

/**
 * Service handling POS and KDS business logic.
 * Manages ledgers, order lifecycle, and real-time event broadcasting.
 */
@Injectable()
export class PosService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  /**
   * Opens a new cash ledger for a location.
   * Ensures only one ledger is open per location at a time.
   */
  async openLedger(
    organizationId: string,
    locationId: string,
    startingCash: number,
  ) {
    // ... logic
  }

  /**
   * Closes an open ledger and calculates cash variances.
   */
  async closeLedger(ledgerId: string, actualCash: number) {
    // ... logic
  }

  /**
   * Records a finalized sale and notifies the KDS if the order remains OPEN.
   */
  async recordSale(organizationId: string, orderData: any, ledgerId: string) {
    // ... logic
  }

  /**
   * Retrieves the currently open ledger for a location.
   */
  async getOpenLedger(locationId: string) {
    // ... logic
  }

  /**
   * Fetches all orders with OPEN status for an organization.
   */
  async getActiveOrders(organizationId: string) {
    // ... logic
  }

  /**
   * Fetches orders for an organization with optional status filtering.
   */
  async getOrders(organizationId: string, status?: string, limit: number = 50) {
    return this.dbService.readDb.query.posOrders.findMany({
      where: and(
        eq(posOrders.organizationId, organizationId),
        status ? eq(posOrders.status, status) : undefined,
      ),
      with: {
        items: true,
      },
      orderBy: [desc(posOrders.createdAt)],
      limit,
    });
  }

  /**
   * Updates an order's status and returns the updated record.
   */
  async updateOrderStatus(orderId: string, status: string) {
    const [order] = await this.dbService.db
      .update(posOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(posOrders.id, orderId))
      .returning();
    return order;
  }
}
