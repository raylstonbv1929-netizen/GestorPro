status: in_progress
agent: frontend-specialist
---

# Projeto: Unified Tactical Filter (Standardization)

Implementar o padrão "Intelligence Blade" como um sistema de filtragem universal para todas as páginas do sistema.

## 🎯 Objetivos
- [ ] Criar `TacticalFilterBlade.tsx` em `src/components/common/`.
- [ ] Criar `useTacticalFilter.ts` em `src/hooks/`.
- [ ] Implementar sistema de "Sectores" (Logística, Técnica, Financeira) configuráveis por Props.
- [ ] Padronizar Blur (30px), Sombras de profundidade e Animações Táticas.
- [ ] Migrar Páginas:
    - [ ] FieldApplicationsPage (Referência)
    - [ ] FinancePage
    - [ ] ProductsPage
    - [ ] CollaboratorsPage

## 🛠️ Arquitetura Técnica
- **Hook**: Gerencia o estado de `searchTerm`, `dateRange` e `advancedFilters`.
- **Componente**: Fornece o invólucro CSS (Glassmorphism) e os slots para inputs específicos.
- **Métricas**: Interface genérica para exibir telemetria (Count, Total, Proporção).

## ✅ Critérios de Aceite
- Consistência visual de 100% entre as páginas.
- Zero perda de funcionalidade na transição.
- Redução de pelo menos 150 linhas de código por página refatorada.
