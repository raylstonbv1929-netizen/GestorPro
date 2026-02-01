# PLAN: Product Logistics Enhancement - Phase Final

## 1. ANALYSIS
The dual-unit system (Logistical Unit vs. Measurement Unit) has been partially implemented across core components (`ProductCard`, `QuickAdjustPopover`, `AuditForms`, `MovementsLedger`, `AppContext`). 

### Core Logic Status:
- [x] Type definition updated with `capacityUnit`.
- [x] `calculateNormalizedQuantity` refined with 8-decimal precision.
- [x] Smart unit switching in `QuickAdjustPopover`.
- [x] Dual unit breakdown in UI components.

### Remaining Optimization Points:
- [ ] **Data Integrity Audit:** Ensure all legacy products handle the new null/optional fields gracefully.
- [ ] **UI Polish:** Normalize CSS tokens across new logistics selectors (e.g., matching the "Sentinel" theme).
- [ ] **Validation Layer:** Robust check during bulk import if `unitWeight` is missing/zero when `capacityUnit` is present.
- [ ] **Verification:** Run security and linting scripts to ensure code stability.

## 2. PLANNING (Agents)
1. **project-planner**: (Current) Orchestrating the final phase.
2. **frontend-specialist**: Will audit the UI components (`AuditForm`, `ProductCard`, `QuickAdjustPopover`) for consistent "Sentinel" aesthetics and accessibility.
3. **backend-specialist**: (Context of AppContext/Data) Will verify the calculation matrix and ensure data persistence patterns are safe (specifically null-handling for `capacityUnit`).
4. **test-engineer**: Will execute verification scripts (`lint_runner.py`, `security_scan.py`).

## 3. SOLUTIONING
- **Frontend**: Standardize the "Blue" theme for Capacity/Medida and "Emerald" for Logistics across all forms.
- **Logic**: Centralize `UNIT_CONFIG` factors if possible, or ensure `AppContext` remains the single source of truth for normalization.
- **Verification**: Run `lint_runner.py` and `security_scan.py`.

## 4. IMPLEMENTATION TASKS
### Group A: Foundation (backend-specialist)
- [ ] Audit `AppContext.tsx` for edge cases in `calculateNormalizedQuantity` (e.g., extreme values).
- [ ] Ensure `handleStockAdjustment` correctly handles `quantityUnit` persistence.

### Group B: UI Consistency (frontend-specialist)
- [ ] Sync `AuditForm.tsx` seletors with the new blue/emerald design tokens used in `QuickAdjustPopover`.
- [ ] Ensure `BulkAuditForm.tsx` "Saída" column has clear visual separation.

### Group C: Verification (test-engineer)
- [ ] Run `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`
- [ ] Run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] Final project audit with `python .agent/scripts/checklist.py .`
