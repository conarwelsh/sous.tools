export interface PosInterface {
  /**
   * Fetch sales data for a specific period
   */
  fetchSales(startDate: Date, endDate: Date): Promise<any[]>;

  /**
   * Fetch the product catalog from the POS
   */
  fetchCatalog(): Promise<any[]>;

  /**
   * Process an order through the POS
   */
  createOrder(orderData: any): Promise<any>;

  /**
   * Get real-time updates (if supported by driver)
   */
  subscribeToOrders(callback: (order: any) => void): void;
}
