# ADR 051: Standardization of "Item" to "Product" in POS Integrations

## Status
Accepted

## Context
In the Point of Sale (POS) domain and various integrations (Square, Toast, etc.), the terms "Item" and "Product" are often used interchangeably. This inconsistency leads to confusion in the codebase, database schema, and API responses. To align with our Culinary domain (which uses `products`) and standard e-commerce terminology, we need a unified naming convention.

## Decision
We will standardize on the term **"Product"** globally across the platform.

1.  **Database Schema**:
    *   `pos_order_items` table will be renamed to `pos_order_products`.
    *   Fields like `linked_pos_item_id` in `recipes` will be renamed to `linked_pos_product_id`.
2.  **API/DTOs**:
    *   GraphQL types will use `Product` (e.g., `PosProduct` instead of `PosItem`).
    *   Integration drivers (Square, Toast) will map external "Items" to internal "Products".
3.  **UI/Frontend**:
    *   All references to "Items" in the context of a catalog or menu will be updated to "Products".

## Consequences
*   **Breaking Change**: This is a database schema change and will require a migration/reset.
*   **Consistency**: The codebase will be easier to understand and maintain.
*   **Alignment**: Matches the `products` table in the Culinary domain.
