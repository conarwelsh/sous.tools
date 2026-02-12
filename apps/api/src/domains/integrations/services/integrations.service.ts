import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  integrationConfigs,
  categories,
  products,
  recipes,
} from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';
import { DriverFactory } from '../drivers/driver.factory.js';
import { SquareDriver } from '../drivers/square.driver.js';
import { CulinaryService } from '../../culinary/services/culinary.service.js';
import { IngestionService } from '../../ingestion/services/ingestion.service.js';
import { logger } from '@sous/logger';
import { config } from '@sous/config';

@Injectable()
export class IntegrationsService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    private readonly driverFactory: DriverFactory,
    @Inject(forwardRef(() => CulinaryService))
    private readonly culinaryService: CulinaryService,
    private readonly ingestionService: IngestionService,
  ) {}

  async getIntegration(organizationId: string, provider: string) {
    return this.dbService.db.query.integrationConfigs.findFirst({
      where: (ic) =>
        and(eq(ic.organizationId, organizationId), eq(ic.provider, provider)),
    });
  }

  async getIntegrations(organizationId: string) {
    return this.dbService.db.query.integrationConfigs.findMany({
      where: (ic) => eq(ic.organizationId, organizationId),
    });
  }

  async getSquareAuthorizeUrl(organizationId: string) {
    const { applicationId, environment, redirectUri } = config.square;

    // Authorization page hostnames
    const authBaseUrl =
      environment === 'sandbox'
        ? 'https://squareupsandbox.com'
        : 'https://squareup.com';

    const scopes = [
      'ITEMS_READ',
      'ITEMS_WRITE',
      'ORDERS_READ',
      'INVENTORY_READ',
      'MERCHANT_PROFILE_READ',
    ].join(' ');

    const url = new URL(`${authBaseUrl}/oauth2/authorize`);
    url.searchParams.append('client_id', applicationId || '');
    url.searchParams.append('scope', scopes);
    url.searchParams.append('state', organizationId);
    url.searchParams.append('response_type', 'code');

    // Normalize API URL to remove trailing slash
    const apiBaseUrl = config.api.url?.endsWith('/')
      ? config.api.url.slice(0, -1)
      : config.api.url;

    // Use configured redirectUri or default to the API's callback endpoint
    const effectiveRedirectUri =
      redirectUri || `${apiBaseUrl}/integrations/square/callback`;
    url.searchParams.append('redirect_uri', effectiveRedirectUri);

    const finalUrl = url.toString();
    logger.info(`[Square] Generated Authorize URL: ${finalUrl}`);

    return finalUrl;
  }

  async getGoogleAuthorizeUrl(organizationId: string) {
    const { clientId, redirectUri } = config.google;
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    const url = new URL(baseUrl);
    url.searchParams.append('client_id', clientId || '');
    url.searchParams.append(
      'redirect_uri',
      redirectUri || `${config.api.url}/integrations/google-drive/callback`,
    );
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scopes);
    url.searchParams.append('access_type', 'offline');
    url.searchParams.append('prompt', 'consent select_account');
    url.searchParams.append('include_granted_scopes', 'true');
    url.searchParams.append('state', organizationId);

    return url.toString();
  }

  async handleGoogleCallback(code: string, state: string) {
    const { clientId, clientSecret, redirectUri } = config.google;
    const organizationId = state;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri:
          redirectUri || `${config.api.url}/integrations/google-drive/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('[Google] OAuth Token Exchange Failed', data);
      throw new Error('OAuth exchange failed');
    }

    await this.connect(organizationId, 'google-drive', {
      accessToken: data.access_token,
      refreshToken: data.refresh_token, // This will be present because of prompt=consent
      expiresAt: new Date(
        Date.now() + (data.expires_in || 3600) * 1000,
      ).toISOString(),
      scope: data.scope,
    });

    return { organizationId };
  }

  async refreshGoogleToken(organizationId: string, credentials: any) {
    const { clientId, clientSecret } = config.google;

    if (!credentials.refreshToken) {
      logger.error(
        `[Google] No refresh token available for org ${organizationId}`,
      );
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: credentials.refreshToken,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('[Google] OAuth Token Refresh Failed', data);
      throw new Error('OAuth refresh failed');
    }

    const newCredentials = {
      ...credentials,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || credentials.refreshToken, // Handle rotation
      expiresAt: new Date(
        Date.now() + (data.expires_in || 3600) * 1000,
      ).toISOString(),
      scope: data.scope || credentials.scope,
    };

    // Update the DB
    await this.connect(organizationId, 'google-drive', newCredentials);

    return newCredentials;
  }

  async listGoogleDriveFiles(organizationId: string, folderId?: string) {
    const configEntry = await this.getIntegration(
      organizationId,
      'google-drive',
    );
    if (!configEntry) throw new Error('Google Drive integration not found');

    let credentials = JSON.parse(configEntry.encryptedCredentials);
    const expiresAt = credentials.expiresAt
      ? new Date(credentials.expiresAt)
      : null;

    if (expiresAt && expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
      credentials = await this.refreshGoogleToken(organizationId, credentials);
    }

    const driver = this.driverFactory.getStorageDriver(
      'google-drive',
      credentials,
    );
    return driver.listFiles(folderId);
  }

  async handleSquareCallback(code: string, state: string) {
    const { applicationId, clientSecret, environment, redirectUri } =
      config.square;
    const organizationId = state;

    if (!clientSecret) {
      logger.error(
        '[Square] Cannot complete OAuth: SQUARE_CLIENT_SECRET is missing from the environment.',
      );
      throw new Error('Integration configuration error');
    }

    const baseUrl =
      environment === 'sandbox'
        ? 'https://connect.squareupsandbox.com'
        : 'https://connect.squareup.com';

    // Normalize our API URL to remove trailing slash for the redirect_uri match
    const myApiBaseUrl = config.api.url?.endsWith('/')
      ? config.api.url.slice(0, -1)
      : config.api.url;

    const effectiveRedirectUri =
      redirectUri || `${myApiBaseUrl}/integrations/square/callback`;

    const response = await fetch(`${baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: applicationId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: effectiveRedirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('[Square] OAuth Token Exchange Failed', {
        status: response.status,
        code: data.errors?.[0]?.code,
        detail: data.errors?.[0]?.detail,
      });
      throw new Error('OAuth exchange failed');
    }

    await this.connect(organizationId, 'square', {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      merchantId: data.merchant_id,
      expiresAt: data.expires_at,
      environment: config.square.environment, // Store the environment used for this token
    });

    return { organizationId };
  }

  async connect(organizationId: string, provider: string, credentials: any) {
    // Encrypt credentials here (Mocking for now)
    const encrypted = JSON.stringify(credentials);

    await this.dbService.db
      .insert(integrationConfigs)
      .values({
        organizationId,
        provider,
        encryptedCredentials: encrypted,
        settings: '{}',
      })
      .onConflictDoUpdate({
        target: [
          integrationConfigs.organizationId,
          integrationConfigs.provider,
        ],
        set: { encryptedCredentials: encrypted, updatedAt: new Date() },
      });
  }

  async disconnect(organizationId: string, provider: string) {
    await this.dbService.db
      .delete(integrationConfigs)
      .where(
        and(
          eq(integrationConfigs.organizationId, organizationId),
          eq(integrationConfigs.provider, provider),
        ),
      );
  }

  async getStorageDriver(organizationId: string, provider: string) {
    const configEntry = await this.getIntegration(organizationId, provider);
    if (!configEntry) throw new Error('Integration not found');

    let credentials = JSON.parse(configEntry.encryptedCredentials);
    const expiresAt = credentials.expiresAt
      ? new Date(credentials.expiresAt)
      : null;

    if (expiresAt && expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
      credentials = await this.refreshGoogleToken(organizationId, credentials);
    }

    return this.driverFactory.getStorageDriver(provider, credentials);
  }

  async sync(organizationId: string, provider: string, fileId?: string) {
    const configEntry = await this.getIntegration(organizationId, provider);
    if (!configEntry) throw new Error('Integration not found');

    const credentials = JSON.parse(configEntry.encryptedCredentials);

    // Ensure environment is set, defaulting to current system config if missing from DB
    if (!credentials.environment) {
      credentials.environment = config.square.environment;
    }

    if (provider === 'square') {
      logger.info(
        `[Integrations] Starting Square sync for org ${organizationId}`,
      );
      const driver = this.driverFactory.getPOSDriver(provider, credentials);

      // 1. Sync Catalog
      const catalogItems = await driver.fetchCatalog();

      const sqCategories = catalogItems.filter(
        (item: any) => item.type === 'CATEGORY',
      );
      const sqProducts = catalogItems.filter(
        (item: any) => item.type === 'ITEM',
      );

      const categoryMap = new Map<string, string>();

      // Upsert Categories
      for (const cat of sqCategories) {
        const result = await this.dbService.db
          .insert(categories)
          .values({
            name: cat.name,
            organizationId,
          })
          .onConflictDoNothing()
          .returning();

        if (result[0]) {
          categoryMap.set(cat.id, result[0].id);
        } else {
          const existing = await this.dbService.db.query.categories.findFirst({
            where: and(
              eq(categories.name, cat.name),
              eq(categories.organizationId, organizationId),
            ),
          });
          if (existing) categoryMap.set(cat.id, existing.id);
        }
      }

      // Upsert Products
      for (const prod of sqProducts) {
        await this.dbService.db
          .insert(products)
          .values({
            name: prod.name,
            price: prod.price,
            categoryId: prod.categoryId
              ? categoryMap.get(prod.categoryId)
              : null,
            organizationId,
            linkedPosItemId: prod.id,
          })
          .onConflictDoUpdate({
            target: [products.name, products.organizationId],
            set: {
              price: prod.price,
              categoryId: prod.categoryId
                ? categoryMap.get(prod.categoryId)
                : null,
              linkedPosItemId: prod.id,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (provider === 'google-drive') {
      logger.info(
        `[Integrations] Starting Google Drive sync for org ${organizationId} (File: ${fileId || 'ALL'})`,
      );

      let currentCredentials = credentials;
      const expiresAt = credentials.expiresAt
        ? new Date(credentials.expiresAt)
        : null;

      // Refresh if expired or expiring in the next 5 minutes
      if (expiresAt && expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
        logger.info(
          `[Integrations] Google Drive token expired or expiring soon for org ${organizationId}, refreshing...`,
        );
        try {
          currentCredentials = await this.refreshGoogleToken(
            organizationId,
            credentials,
          );
        } catch (error) {
          logger.error(
            `[Integrations] Failed to refresh Google Drive token for org ${organizationId}`,
            error,
          );
          throw error;
        }
      }

      logger.debug(
        `[Integrations] Initializing Google Drive driver for org ${organizationId}. Credentials keys: ${Object.keys(currentCredentials).join(', ')}`,
      );
      const driver = this.driverFactory.getStorageDriver(
        provider,
        currentCredentials,
      );

      let files = [];
      if (fileId) {
        const file = await driver.getFile(fileId);
        files = [file];
      } else {
        files = await driver.listFiles();
      }

      for (const file of files) {
        // Skip folders during ingestion
        if (file.mimeType === 'application/vnd.google-apps.folder') continue;

        const result = await this.dbService.db
          .insert(recipes)
          .values({
            organizationId,
            name: file.name,
            sourceType: 'google-drive',
            sourceId: file.id,
            sourceUrl: file.webViewLink,
          })
          .onConflictDoUpdate({
            target: [recipes.organizationId, recipes.sourceId], // Need to add unique constraint for this
            set: {
              name: file.name,
              sourceUrl: file.webViewLink,
              updatedAt: new Date(),
            },
          })
          .returning();

        // Trigger AI Ingestion for this recipe
        const recipe = result[0];
        if (recipe) {
          // Note: In production this should be a background job (BullMQ)
          this.ingestionService
            .processGoogleDriveRecipe(recipe.id, organizationId, driver)
            .catch((err) =>
              logger.error(
                `[Integrations] Background ingestion failed for recipe ${recipe.id}`,
                err,
              ),
            );
        }
      }
    }

    // Update last synced timestamp
    await this.dbService.db
      .update(integrationConfigs)
      .set({ lastSyncedAt: new Date() })
      .where(
        and(
          eq(integrationConfigs.organizationId, organizationId),
          eq(integrationConfigs.provider, provider),
        ),
      );

    return {
      status: 'synced',
      provider,
    };
  }

  async seed(organizationId: string, provider: string) {
    const configEntry = await this.getIntegration(organizationId, provider);
    if (!configEntry) throw new Error('Integration not found');

    const credentials = JSON.parse(configEntry.encryptedCredentials);

    // Ensure environment is set for seeding
    if (!credentials.environment) {
      credentials.environment = config.square.environment;
    }

    if (provider === 'square') {
      const driver = this.driverFactory.getPOSDriver(provider, credentials);
      // We know it's a SquareDriver, but getPOSDriver returns PosInterface.
      // We can either cast or add seed to interface.
      if (driver instanceof SquareDriver) {
        await driver.seedCatalog();
      }
    }

    return { status: 'seeded', provider };
  }
}
