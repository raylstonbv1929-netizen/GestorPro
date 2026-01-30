# Task: Refactor Collaborators Page to Industrial Data-Tech

Refactor the `CollaboratorsPage.tsx` to align with the new project aesthetic: high-tech, premium, financial-industrial, and sharp geometry.

## 🎨 Design Principles
- **Aesthetic**: Industrial Sharp / Data-Tech.
- **Geometry**: Sharp edges (`rounded-none` or `rounded-[2px]`).
- **Typography**: `font-mono` for financial values (salary), dates, and technical metrics.
- **Color Palette**: Slate 950, Emerald 500, Amber 500, Rose 500 (High contrast).
- **Layout**: "Command Center" dashboard style with a technical metrics header.

## 🛠️ Implementation Plan

### Phase 1: Foundation & Header
- [ ] Replace standard header with Technical Industrial Header.
- [ ] Implement technical stats bar with sharp borders and mono fonts for counts.
- [ ] Update background to `bg-slate-950`.

### Phase 2: Tactical Collaborator Grid
- [ ] Refactor collaborator cards to use sharp geometry (`rounded-none`).
- [ ] Implement "System Status" indicators for employee status (Active/Vacation/Inactive).
- [ ] Add hover effects with technical glows and scale-X/Y shifts.
- [ ] Improve typography using `font-mono` for technical data points (Salary, Date).

### Phase 3: Command Controls (Filters & Search)
- [ ] Refactor filter buttons to a technical, segmented control (Sharper borders).
- [ ] Update search input with sharp edges and technical focus states.

### Phase 4: Modal & Form Refinement (Console Militar Upgrade)
- [ ] **Option C: Protocol Integrity Bar**: Implement a technical progress bar below the modal title.
- [ ] **Option A: Tactical Sectioning**: Group fields into "ZONAS" (IDENTIFICAÇÃO, LOGÍSTICA, FINANCEIRO) with technical headers.
- [ ] **Option B: Instrument-Style Inputs**:
    - [ ] Add icons inside inputs (Phone, Mail, Calendar, DollarSign, etc.).
    - [ ] Add "Scan-line" background effect to the modal.
    - [ ] Implement focus glow and input validation indicators.
- [ ] Update the creation/edit modal to the "Industrial Form" style.
- [ ] Implement Status Pills (Active, Vacation, Inactive) instead of a select dropdown.
- [ ] use native `type="date"` for hire date with `[color-scheme:dark]`.
- [ ] Auto-focus on the name field when opening the modal.

## ✅ Verification Criteria
- [ ] No `rounded-xl` or `rounded-2xl` remaining.
- [ ] Page feels like a "Personnel Command Center".
- [ ] Salary formatting (`font-mono`) is consistent.
- [ ] Lint and Type checks pass.
