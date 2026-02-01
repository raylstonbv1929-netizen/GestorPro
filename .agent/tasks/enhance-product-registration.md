# Task: Enhanced Product Registration System

## Objective
Accelerate the registration of large quantities of products (100+) by implementing NFe XML import, smart duplication, and mass actions in the bulk registration grid.

## Proposed Changes

### 1. NFe XML Import (BulkAuditForm)
- [x] Add XML upload zone in `BulkAuditForm`.
- [x] Implement XML parser for Brazilian NFe (extract name, unit, quantity, price, batch, expiration).
- [x] Automatically populate the grid with extracted data.

### 2. Mass Actions (BulkAuditForm)
- [x] Add buttons to set category/unit for all items in the grid.
- [x] Add "Limpar Slots Vazios" action.
- [x] Add "Duplicar Linha" (Clone Row) in the grid.

### 3. Smart Duplication (ProductsPage)
- [x] Add "Duplicar" action to individual product cards.
- [x] Pre-fill the registration form with duplicated data.

### 4. UX & Terminal Aesthetics
- [x] Ensure the XML import feels like a "Data Ingestion" process.
- [x] Add visual feedback for successful imports.
- [x] Add 'Total Mass/Volume' telemetry to ProductCard (e.g., 2 sacks x 50kg = 100kg total).

## Technical Details
- **NFe Tags mapping**:
  - Name: `xProd`
  - Category: (Auto-detected by SMART_MAP or manual)
  - Unit: `uCom`
  - Quantity: `qCom`
  - Price: `vUnCom`
  - Batch: `nLote` (inside `rastro`)
  - Expiration: `dVal` (inside `rastro`)
