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
   * Create a new product
   */
  createProduct(productData: {
    name: string;
    categoryId?: string;
    price: number;
    description?: string;
    sku?: string;
  }): Promise<any>;

  /**
   * Update an existing product
   */
  updateProduct(productId: string, productData: any): Promise<any>;

  /**
   * Delete/Archive a product
   */
  deleteProduct(productId: string): Promise<any>;

  /**
   * Process an order through the POS
   */
  createOrder(orderData: any): Promise<any>;

  /**
   * Get real-time updates (if supported by driver)
   */
  subscribeToOrders(callback: (order: any) => void): void;
}
