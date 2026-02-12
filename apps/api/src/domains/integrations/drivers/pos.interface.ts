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
   * Fetch business locations
   */
  fetchLocations(): Promise<any[]>;

  /**
   * Fetch current inventory levels
   */
  fetchInventory(): Promise<any[]>;

  /**
   * Create a new category
   */
  createCategory(name: string): Promise<any>;

  /**
   * Create a new item/product
   */
  createItem(itemData: {
    name: string;
    categoryId?: string;
    price: number;
    description?: string;
    sku?: string;
  }): Promise<any>;

  /**
   * Update an existing item
   */
  updateItem(itemId: string, itemData: any): Promise<any>;

  /**
   * Delete/Archive an item
   */
  deleteItem(itemId: string): Promise<any>;

  /**
   * Process an order through the POS
   */
  createOrder(orderData: any): Promise<any>;

  /**
   * Get real-time updates (if supported by driver)
   */
  subscribeToOrders(callback: (order: any) => void): void;
}
