import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { suppliers, invoices, invoiceItems } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class ProcurementService {
  constructor(private readonly dbService: DatabaseService) {}

  async getSuppliers(organizationId: string) {
    return this.dbService.db.select().from(suppliers).where(eq(suppliers.organizationId, organizationId));
  }

  async createSupplier(data: typeof suppliers.$inferInsert) {
    const result = await this.dbService.db.insert(suppliers).values(data).returning();
    return result[0];
  }

  async getInvoices(organizationId: string) {
    return this.dbService.db.select().from(invoices).where(eq(invoices.organizationId, organizationId));
  }

  async createInvoice(data: typeof invoices.$inferInsert, items: (typeof invoiceItems.$inferInsert)[]) {
    return await this.dbService.db.transaction(async (tx) => {
      const [invoice] = await tx.insert(invoices).values(data).returning();
      
      if (items.length > 0) {
        await tx.insert(invoiceItems).values(
          items.map(item => ({ ...item, invoiceId: invoice.id }))
        );
      }
      
      return invoice;
    });
  }
}
