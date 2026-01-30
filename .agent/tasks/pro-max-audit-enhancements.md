# Task: Pro Max Audit Enhancements - Products Page

## Context
Refactor and enhance the Products Page to implement three strategic features: Modularization, Quick Stock Adjustment, and Batch/Expiration support.

## Project Type
WEB (React/Next.js)

## Features to Implement
1. **Modularization (Refactoring)**: Extract sub-components from `ProductsPage.tsx` into separate files in `src/pages/products/components/`.
2. **Quick Adjust Popover**: Implement a popover for fast stock adjustments with reason selection.
3. **Batch and Expiration Support**: Add fields for batch numbers and expiration dates to the product model and UI.

## Phase 1: Planning & Setup
- [ ] Define the new structure for modular components.
- [ ] Update `Product` type to include `batch` and `expirationDate` (if not already present).
- [ ] Verify `AppContext` readiness for these changes.

## Phase 2: Implementation (Modularization)
- [ ] Extract `AuditHeader` component.
- [ ] Extract `ProductCard` component.
- [ ] Extract `AuditForm` component.
- [ ] Extract `MovementsLedger` component.
- [ ] Update `ProductsPage.tsx` to use these components.

## Phase 3: Implementation (Quick Adjust)
- [ ] Create `QuickAdjustPopover` component.
- [ ] Integrate with `handleStockAdjustment` in `AppContext`.
- [ ] Add trigger to `ProductCard`.

## Phase 4: Implementation (Batch & Expiration)
- [ ] Add `batch` and `expirationDate` fields to `AuditForm`.
- [ ] Display batch/expiry info in `ProductCard`.
- [ ] Add validation/alerts for expiring items in `AuditHeader`.

## Phase 5: Verification
- [ ] Run `checklist.py`.
- [ ] Verify TypeScript integrity.
- [ ] Test stock adjustment flow.

## Agent Assignment
- **Orchestrator**: Coordination.
- **Frontend Specialist**: UI/UX implementation and refactoring.
- **Backend Specialist**: Type updates and context logic (if needed).
- **Test Engineer**: Verification.
