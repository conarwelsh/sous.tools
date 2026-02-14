import { logger } from '@sous/logger';
import { config } from '@sous/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './domains/core/database/schema.js';
import { eq, sql } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const type = process.argv[2] || 'system';
  logger.info(`🌱 Starting standalone seed process: ${type}`);

  const pool = new Pool({ connectionString: config.db.url });
  const db = drizzle(pool, { schema });

  try {
    // --- SYSTEM SEEDING ---
    logger.info('🌱 Seeding Plans...');
    const insertedPlans = await db.insert(schema.plans).values([
      {
        name: 'Commis',
        slug: 'COMMIS',
        baseScopes: [
          'pos:sale', 
          'inventory:view', 
          'inventory:adjust', 
          'watch:notifications'
        ],
        limits: { 
          max_locations: 1, 
          max_users: 3, 
          max_recipes: 50 
        },
      },
      {
        name: 'Chef de Partie',
        slug: 'CHEF_DE_PARTIE',
        baseScopes: [
          'pos:sale', 
          'inventory:manage', 
          'watch:notifications',
          'watch:cook-mode',
          'watch:voice',
          'kds:manage',
          'kds:route',
          'recipe:manage',
          'recipe:cost',
          'recipe:scale',
          'hardware:ble'
        ],
        limits: { 
          max_locations: 3, 
          max_users: 15, 
          max_recipes: 1000 
        },
      },
      {
        name: 'Executive Chef',
        slug: 'EXECUTIVE_CHEF',
        baseScopes: [
          'pos:sale', 
          'inventory:manage', 
          'watch:notifications',
          'watch:cook-mode',
          'watch:voice',
          'kds:manage',
          'kds:route',
          'recipe:manage',
          'recipe:cost',
          'recipe:scale',
          'hardware:ble',
          'hardware:manage',
          'intel:acoustic', 
          'intel:cv-waste',
          'procure:ai-negotiate', 
          'pos:dynamic-pricing', 
          'watch:custom-face',
          'admin:billing:view',
          'admin:user:manage'
        ],
        limits: { 
          max_locations: 50, 
          max_users: 500, 
          max_recipes: 10000 
        },
      },
    ]).onConflictDoUpdate({
      target: schema.plans.slug,
      set: {
        baseScopes: sql`EXCLUDED.base_scopes`,
        limits: sql`EXCLUDED.limits`,
        name: sql`EXCLUDED.name`
      }
    }).returning();

    // Map plans by slug for linking
    const planMap = new Map(insertedPlans.map(p => [p.slug, p.id]));
    
    // If returning() didn't give us IDs (e.g. on conflict update with no changes), fetch them
    if (planMap.size === 0) {
       const allPlans = await db.select().from(schema.plans);
       allPlans.forEach(p => planMap.set(p.slug, p.id));
    }

    logger.info('🌱 Seeding Billing Plans...');
    await db.insert(schema.billingPlans).values([
      {
        name: 'Commis Monthly',
        slug: 'commis-monthly',
        priceMonthly: 5900, // $59.00
        currency: 'USD',
        accessPlanId: planMap.get('COMMIS'),
      },
      {
        name: 'Chef de Partie Monthly',
        slug: 'chef-de-partie-monthly',
        priceMonthly: 14900, // $149.00
        currency: 'USD',
        accessPlanId: planMap.get('CHEF_DE_PARTIE'),
      },
      {
        name: 'Executive Chef Monthly',
        slug: 'executive-chef-monthly',
        priceMonthly: 39900, // $399.00
        currency: 'USD',
        accessPlanId: planMap.get('EXECUTIVE_CHEF'),
      },
    ]).onConflictDoUpdate({
      target: schema.billingPlans.slug,
      set: {
        priceMonthly: sql`EXCLUDED.price_monthly`,
        accessPlanId: sql`EXCLUDED.access_plan_id`,
        name: sql`EXCLUDED.name`
      }
    });

    logger.info('🌱 Seeding System Organization...');
    await db.insert(schema.organizations).values({
      name: 'System',
      slug: 'system',
    }).onConflictDoNothing();

    logger.info('🌱 Seeding Superadmin Context (Chef Conar)...');
    const [superOrg] = await db.insert(schema.organizations).values({
      name: 'Chef Conar',
      slug: 'chef-conar',
    }).onConflictDoUpdate({
      target: schema.organizations.slug,
      set: { name: 'Chef Conar' },
    }).returning();

    const superOrgId = superOrg.id;
    const commonPasswordHash = await bcrypt.hash('password', 10);

    logger.info('🌱 Seeding Primary Superadmin...');
    await db.insert(schema.users).values({
      email: 'conar@sous.tools',
      firstName: 'Conar',
      lastName: 'Welsh',
      passwordHash: commonPasswordHash,
      organizationId: superOrgId,
      role: 'superadmin',
    }).onConflictDoUpdate({
      target: schema.users.email,
      set: { firstName: 'Conar', lastName: 'Welsh', role: 'superadmin', organizationId: superOrgId }
    });

    await db.insert(schema.locations).values({
      organizationId: superOrgId,
      name: 'Dtown Café',
    }).onConflictDoNothing();

    // --- SAMPLE SEEDING ---
    if (type === 'sample') {
      logger.info('🧪 Seeding Sample Organization...');
      const [sampleOrg] = await db.insert(schema.organizations).values({
        name: 'Sample Kitchen',
        slug: 'sample-kitchen',
      }).onConflictDoNothing().returning();

      const sampleOrgId = sampleOrg?.id || (await db.query.organizations.findFirst({ where: eq(schema.organizations.slug, 'sample-kitchen') }))?.id;

      if (sampleOrgId) {
        logger.info('🧪 Seeding Role-based Test Users...');
        
        const testUsers = [
          { email: 'admin@sous.tools', first: 'Admin', last: 'User', role: 'admin' },
          { email: 'user@sous.tools', first: 'Regular', last: 'User', role: 'user' },
          { email: 'salesman@sous.tools', first: 'Sales', last: 'Agent', role: 'salesman' },
        ];

        for (const u of testUsers) {
          await db.insert(schema.users).values({
            email: u.email,
            firstName: u.first,
            lastName: u.last,
            passwordHash: commonPasswordHash,
            organizationId: sampleOrgId,
            role: u.role as any,
          }).onConflictDoUpdate({
            target: schema.users.email,
            set: { role: u.role as any, organizationId: sampleOrgId }
          });
          logger.info(`   ✅ Seeded ${u.role}: ${u.email}`);
        }

        logger.info('🧪 Seeding Sample Location...');
        await db.insert(schema.locations).values({
          organizationId: sampleOrgId,
          name: 'Main Store',
        }).onConflictDoNothing();

        logger.info('🧪 Seeding Culinary Sample Data...');
        const [flour] = await db.insert(schema.ingredients).values({
          name: 'All-Purpose Flour',
          baseUnit: 'kg',
          currentPrice: 120,
          organizationId: sampleOrgId,
        }).onConflictDoNothing().returning();

        await db.insert(schema.recipes).values({
          name: 'Simple Bread',
          yieldAmount: 1000,
          yieldUnit: 'g',
          organizationId: sampleOrgId,
        }).onConflictDoNothing();

        const [beers] = await db.insert(schema.categories).values({
          name: 'Draft Beers',
          organizationId: sampleOrgId,
        }).onConflictDoNothing().returning();

        if (beers) {
          await db.insert(schema.products).values([
            { name: 'Pilsner', price: 700, categoryId: beers.id, organizationId: sampleOrgId },
            { name: 'IPA', price: 800, categoryId: beers.id, organizationId: sampleOrgId },
          ]).onConflictDoNothing();
        }

        const [burgers] = await db.insert(schema.categories).values({
          name: 'Burgers',
          organizationId: sampleOrgId,
        }).onConflictDoNothing().returning();

        if (burgers) {
          await db.insert(schema.products).values([
            { name: 'Classic Burger', price: 1500, categoryId: burgers.id, organizationId: sampleOrgId },
            { name: 'Cheeseburger', price: 1700, categoryId: burgers.id, organizationId: sampleOrgId },
          ]).onConflictDoNothing();
        }

        logger.info('🧪 Seeding Presentation Sample Data...');
        await db.insert(schema.displays).values({
          name: 'Main Entrance TV',
          organizationId: sampleOrgId,
        }).onConflictDoNothing();

        logger.info('🧪 Seeding Procurement Sample Data...');
        await db.insert(schema.suppliers).values([
          { name: 'Sysco', organizationId: sampleOrgId, deliveryDays: [1, 3, 5], cutoffTime: '16:00' },
          { name: 'US Foods', organizationId: sampleOrgId, deliveryDays: [2, 4], cutoffTime: '15:00' },
        ]).onConflictDoNothing();
      }
    }

    logger.info('✨ Seeding process finished successfully.');
  } catch (e: any) {
    logger.error(`❌ Seeding failed: ${e.message}`);
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
