import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { MailService } from '../../core/mail/mail.service.js';
import { PaymentDriverFactory } from '../drivers/driver.factory.js';
import { organizations, billingSubscriptions, users, plans } from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class BillingService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    private readonly driverFactory: PaymentDriverFactory,
    private readonly mailService: MailService,
  ) {}

  async subscribe(organizationId: string, planSlug: string, provider = 'stripe') {
    const org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      with: {
        users: true,
      }
    });

    if (!org) throw new Error('Organization not found');

    const driver = this.driverFactory.getDriver(provider);

    // ... (logic remains same) ...
    // 1. Ensure Customer exists
    let externalCustomerId: string;
    const existingSub = await this.dbService.db.query.billingSubscriptions.findFirst({
      where: and(
        eq(billingSubscriptions.organizationId, organizationId),
        eq(billingSubscriptions.provider, provider)
      ),
    });

    if (existingSub?.externalCustomerId) {
      externalCustomerId = existingSub.externalCustomerId;
    } else {
      externalCustomerId = await driver.createCustomer({ name: org.name, id: org.id });
    }

    // 2. Create Subscription
    const result = await driver.createSubscription(externalCustomerId, planSlug);

    // 3. Save to DB
    await this.dbService.db.insert(billingSubscriptions).values({
      organizationId,
      provider,
      externalCustomerId,
      externalSubscriptionId: result.externalSubscriptionId,
      status: result.status,
      currentPeriodEnd: result.currentPeriodEnd,
    }).onConflictDoUpdate({
      target: [billingSubscriptions.organizationId, billingSubscriptions.provider],
      set: {
        externalSubscriptionId: result.externalSubscriptionId,
        status: result.status,
        currentPeriodEnd: result.currentPeriodEnd,
        updatedAt: new Date(),
      }
    });

    // 4. Update Org Status
    const plan = await this.dbService.db.query.plans.findFirst({
      where: eq(plans.slug, planSlug),
    });

    await this.dbService.db.update(organizations).set({
      planStatus: 'active',
      planId: plan?.id,
      updatedAt: new Date(),
    }).where(eq(organizations.id, organizationId));

    // 5. Send Email to admins
    const admins = org.users.filter(u => u.role === 'admin' || u.role === 'superadmin');
    for (const admin of admins) {
      await this.mailService.sendEmail({
        to: admin.email,
        subject: `Subscription Confirmed: ${planSlug}`,
        template: 'subscription-confirmed' as any,
        context: {
          userName: admin.firstName || 'Chef',
          planName: plan?.name || planSlug,
          orgName: org.name,
        },
      });
    }

    logger.info(`[Billing] Organization ${organizationId} subscribed to ${planSlug} via ${provider}`);

    return result;
  }

  async getSubscription(organizationId: string) {
    return this.dbService.db.query.billingSubscriptions.findFirst({
      where: eq(billingSubscriptions.organizationId, organizationId),
    });
  }

  async getPlans() {
    return this.dbService.db.query.billingPlans.findMany();
  }
}
