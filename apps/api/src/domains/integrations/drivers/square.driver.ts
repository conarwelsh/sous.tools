import { Injectable } from '@nestjs/common';
import { logger } from '@sous/logger';
import { PosInterface } from './pos.interface.js';

@Injectable()
export class SquareDriver implements PosInterface {
  private accessToken: string;

  constructor(credentials: { accessToken: string }) {
    this.accessToken = credentials.accessToken;
  }

  async fetchSales(startDate: Date, endDate: Date) {
    logger.info(
      `[Square] Fetching sales from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );
    // Real Square API call would go here
    return [];
  }

  async fetchCatalog() {
    logger.info(`[Square] Fetching catalog`);
    return [];
  }

  async createOrder(orderData: any) {
    logger.info(`[Square] Creating order`, orderData);
    return { success: true, id: `sq_${Date.now()}` };
  }

  subscribeToOrders(callback: (order: any) => void) {
    logger.info(`[Square] Subscribing to webhooks (mocked)`);
    // Setup webhooks or polling here
  }
}
