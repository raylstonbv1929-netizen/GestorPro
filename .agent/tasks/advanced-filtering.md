# Task: Advanced Tactical Filtering - Products Page

## Context
Implement a high-precision filtering system for the Products Page to allow deep logistics and financial audits.

## Project Type
WEB (React)

## Features to Implement
1. **Advanced Filter State**: Refactor the simple `filter` string into a structured `FilterCriteria` object.
2. **AdvancedFilters Component**: A tactical side drawer or expanded panel for multi-selection.
3. **Multi-Category Selection**: Filter by multiple strategic divisions simultaneously.
4. **Status & Risk Filtering**: Identify items by risk level (Healthy, Low, Critical, Expiring).
5. **Financial & Volume Ranges**: Filter by price and stock quantity ranges.
6. **Temporal Filtering**: Filter by expiration windows (30, 60, 90 days).
7. **Active Filter Chips**: UI indicators for active filters with one-click removal.

## Phase 1: Planning
- [ ] Define `FilterCriteria` interface.
- [ ] Map all filterable fields in the `Product` model.

## Phase 2: Implementation (Component)
- [ ] Create `src/pages/products/components/AdvancedFilters.tsx`.
- [ ] Implement the side drawer/dropdown UI with "Cyber Financial" aesthetic.
- [ ] Add range inputs for price/stock.
- [ ] Add multi-select checkboxes for categories and status.

## Phase 3: Integration (Logic)
- [ ] Update state in `ProductsPage.tsx`.
- [ ] Refactor `filteredProducts` logic to handle the new `FilterCriteria`.
- [ ] Add `FilterChips` area above the product grid.

## Phase 4: UX Polish
- [ ] Add animations for drawer opening/closing.
- [ ] Implement "Clear All" functionality.
- [ ] Ensure mobile responsiveness.

## Verification
- [ ] Test filtering combinations.
- [ ] Verify performance with 100+ items.
- [ ] Run `npx tsc --noEmit`.

## Agent Assignment
- **Orchestrator**: Coordination.
- **Frontend Specialist**: UI, state management, and filtering logic.
- **Test Engineer**: Verification.
