import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { posOrders, posOrderProducts, posLedgers, financialTransactions } from '../pos.schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class PosService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {}

  async openLedger(organizationId: string, locationId: string, startingCash: number) {
    // Ensure no other ledger is open for this location
    const openLedger = await this.dbService.readDb.query.posLedgers.findFirst({
      where: and(
        eq(posLedgers.locationId, locationId),
        eq(posLedgers.status, 'OPEN'),
      ),
    });

    if (openLedger) throw new BadRequestException('A ledger is already open for this location');

    const [ledger] = await this.dbService.db.insert(posLedgers).values({
      organizationId,
      locationId,
      startingCash,
      status: 'OPEN',
    }).returning();

    return ledger;
  }

  async closeLedger(ledgerId: string, actualCash: number) {
    const ledger = await this.dbService.readDb.query.posLedgers.findFirst({
      where: eq(posLedgers.id, ledgerId),
    });

    if (!ledger || ledger.status !== 'OPEN') throw new BadRequestException('Ledger not found or already closed');

    // Calculate expected cash
    const transactions = await this.dbService.readDb.query.financialTransactions.findMany({
      where: eq(financialTransactions.ledgerId, ledgerId),
    });

    const totalSales = transactions.reduce((acc, t) => acc + (t.type === 'SALE' ? t.amount : 0), 0);
    const expectedCash = ledger.startingCash + totalSales; // Simple logic

    await this.dbService.db.update(posLedgers).set({
      status: 'CLOSED',
      closedAt: new Date(),
      actualCash,
      expectedCash,
      updatedAt: new Date(),
    }).where(eq(posLedgers.id, ledgerId));

    return { success: true };
  }

  async recordSale(organizationId: string, orderData: any, ledgerId: string) {
    return await this.dbService.db.transaction(async (tx) => {
      // 1. Create Order
      const [order] = await tx.insert(posOrders).values({
        organizationId,
        externalOrderId: orderData.externalId,
        source: orderData.source,
        status: 'COMPLETED',
        totalAmount: orderData.totalAmount,
      }).returning();

      // 2. Create Products
      if (orderData.items?.length > 0) {
        await tx.insert(posOrderProducts).values(
          orderData.items.map((i: any) => ({
            orderId: order.id,
            name: i.name,
            quantity: i.quantity,
            totalAmount: i.totalAmount,
          }))
        );
      }

      // 3. Record Financial Transaction
      await tx.insert(financialTransactions).values({
        organizationId,
        orderId: order.id,
        ledgerId,
        amount: orderData.totalAmount,
        type: 'SALE',
        method: orderData.paymentMethod || 'CASH',
        externalReference: orderData.externalReference,
      });

      return order;
    });
  }

  async getOpenLedger(locationId: string) {
    return this.dbService.readDb.query.posLedgers.findFirst({
      where: and(
        eq(posLedgers.locationId, locationId),
        eq(posLedgers.status, 'OPEN'),
      ),
    });
  }
}
