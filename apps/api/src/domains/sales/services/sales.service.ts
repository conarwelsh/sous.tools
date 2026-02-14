import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { salesCommissions } from '../sales.schema.js';
import { organizations } from '../../iam/organizations/organizations.schema.js';
import { users } from '../../iam/users/users.schema.js';
import { billingSubscriptions } from '../../billing/billing.schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { logger } from '@sous/logger';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SalesService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCommissionWorker() {
    logger.info(
      '[Sales] CommissionWorker: Scanning for new subscription payments...',
    );
    // In a real implementation, we would scan Stripe payments for the last hour
    // For now, we rely on the webhook to record commissions in real-time.
  }

  async impersonate(salesmanId: string, targetOrgId: string) {
    // 1. Verify attribution
    const org = await this.dbService.readDb.query.organizations.findFirst({
      where: eq(organizations.id, targetOrgId),
    });

    if (!org || org.attributedSalesmanId !== salesmanId) {
      throw new UnauthorizedException(
        'Organization not attributed to this salesman',
      );
    }

    // 2. Find the salesman user
    const salesman = await this.dbService.readDb.query.users.findFirst({
      where: eq(users.id, salesmanId),
    });

    if (!salesman) throw new Error('Salesman not found');

    // 3. Generate a temporary impersonation token
    const payload = {
      sub: salesman.id,
      orgId: targetOrgId,
      role: 'admin', // Impersonate as admin
      isImpersonating: true,
      realSalesmanId: salesman.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getMetrics(salesmanId: string) {
    const attributedOrgs =
      await this.dbService.readDb.query.organizations.findMany({
        where: eq(organizations.attributedSalesmanId, salesmanId),
      });

    const commissions =
      await this.dbService.readDb.query.salesCommissions.findMany({
        where: eq(salesCommissions.salesmanId, salesmanId),
      });

    const totalEarned = commissions.reduce((acc, c) => acc + c.amount, 0);
    const pendingCommissions = commissions
      .filter((c) => c.status === 'PENDING')
      .reduce((acc, c) => acc + c.amount, 0);

    return {
      activeClients: attributedOrgs.length,
      totalEarned,
      pendingCommissions,
      mrr: 0, // Placeholder for now
    };
  }

  async getAttributedOrganizations(salesmanId: string) {
    return this.dbService.readDb.query.organizations.findMany({
      where: eq(organizations.attributedSalesmanId, salesmanId),
      with: {
        plan: true,
      },
    });
  }

  async recordCommission(
    organizationId: string,
    paymentAmount: number,
    externalPaymentId: string,
  ) {
    const org = await this.dbService.readDb.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    if (!org || !org.attributedSalesmanId || org.commissionBps === 0) return;

    const commissionAmount = Math.floor(
      paymentAmount * (org.commissionBps / 10000),
    );

    await this.dbService.db.insert(salesCommissions).values({
      organizationId,
      salesmanId: org.attributedSalesmanId,
      amount: commissionAmount,
      bps: org.commissionBps,
      externalPaymentId,
      status: 'PENDING',
    });

    logger.info(
      `[Sales] Recorded commission of ${commissionAmount} cents for salesman ${org.attributedSalesmanId}`,
    );
  }
}
