---
task: enhance-field-applications
agent: frontend-specialist
status: planning
---

# Enhance Field Applications Page

Upgrade the Field Applications page to a "Mission Control" aesthetic with advanced visualization tools and safety checks.

## 🎯 Objectives
- [ ] Refactor the Application Modal into a "Tactical Command Console".
- [ ] Implement a "Tank HUD" (Visual Tank Mix) for product proportions.
- [ ] Add real-time stock integrity validation within the form.
- [ ] Standardize typography and colors to Cyber Teal & Signal Orange (Financial/Industrial core).

## 🛠️ Technical Plan
### Phase 1: Context & Components
- Identify dependencies in `AppContext.tsx` for real-time stock checks.
- Create local sub-components for the Tank HUD.

### Phase 2: Design Implementation (Tactical Console)
- Apply sharp geometry (0px-2px corners).
- Implement a 3-column "Instrument Panel" layout for the modal.
- Use `Protocol Integrity Bar` for form progress.

### Phase 3: Tank HUD
- Create a vertical/horizontal visual representation of the spray tank.
- Show product proportions as stacked layers with distinct colors.
- Add "Overflow/Insufficient" warnings.

### Phase 4: Stock Integrity
- Add computed property to check `currentProduct.dose * areaApplied` against `product.stock`.
- Highlight products with "Warning: Low Stock" in the mix list.

## 🧪 Verification
- [ ] Verify form submission with and without stock warnings.
- [ ] Test responsive layout of the Tank HUD.
- [ ] Lint check and TypeScript validation.
