status: completed
agent: orchestrator
---

# Tactical Sidebar Intelligence Console

Implement a professional sidebar-based filtering system with advanced telemetry and a command-bar (Omnibox) interface.

## 🎯 Objectives
- [ ] Implement a slide-in sidebar from the right (Tactical Blade).
- [ ] Add a "Command Bar" (Omnibox) at the top of the sidebar for quick token-based/NLP search.
- [ ] Group filters into logical sectors (Logistics, Technical, Operational).
- [ ] Implement a "Telemetria de Resultados" (Result Metrics) at the top of the sidebar that updates in real-time.
- [ ] Visual Style: Sentinel (Sharp edges, Cyber Teal, Signal Orange labels).
- [ ] Cascading logic to prevent empty states.

## 🛠️ Technical Plan
### Phase 1: Infrastructure
- Define `isSidebarOpen` state and associated filters.
- Refactor `filteredApplications` and `filterOptions` to include `equipment` and `target` (as planned in the C-touch).

### Phase 2: Sidebar UI
- Create the slide-in animation and backdrop.
- Implement the "Smart Omnibox" for global searching with tactical feedback.
- Design the Sector-based inputs (Selects and Text inputs).

### Phase 3: Telemetry & Logic
- Add the real-time metrics summary (Area, Investment, Count) inside the sidebar header.
- Ensure all filters are cumulative and reactive.

## 🧪 Verification
- [ ] Test ESC key to close sidebar.
- [ ] Verify metrics accuracy against filtered data.
- [ ] Check responsive layout (Sidebar behavior on mobile).
- [ ] Run `python .agent/scripts/checklist.py src/pages/field/FieldApplicationsPage.tsx`.
