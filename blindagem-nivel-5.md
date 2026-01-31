# Plano: Blindagem Nível 5 (Sentinel Data Bunker)

## Visão Geral
Elevação do Protocolo Sentinel para o Nível 5, transformando o sistema em um bunker de dados resiliente a falhas de rede, erros humanos e corrupção de estado. O objetivo é garantir 100% de disponibilidade e recuperabilidade dos dados operacionais.

## Tipo de Projeto
**WEB** (React + Supabase)

## Critérios de Sucesso
- [ ] Implementação de Snapshot de Emergência automático antes de restaurações.
- [ ] Persistência secundária em LocalStorage como espelho do Supabase (Offline Resilience).
- [ ] Funcionalidade de exportação/importação de arquivo `.sentinel` (JSON criptografado/estilizado).
- [ ] Acionamento de Snapshots de Pânico em deleções críticas.
- [ ] Interface de auditoria de integridade na `SettingsPage`.

## Tech Stack
- **Core:** React Context API (`AppContext`)
- **Persistence:** Supabase (Primary) + LocalStorage (Mirror/Fallback)
- **Security:** AES-256 ou similar para exportação `.sentinel` (opcional, ou apenas JSON formatado)
- **Icons:** `lucide-react`
- **UI:** CSS Vanilla / Tailwind-like custom components

## Estrutura de Arquivos Afetados
- `src/contexts/AppContext.tsx`: Lógica central de espelhamento e auto-rollback.
- `src/pages/settings/SettingsPage.tsx`: UI para exportação/importação e status de integridade.
- `src/types/index.ts`: Adição de tipos para metadados de integridade.
- `src/components/ui/TechnicalConfirmModal.tsx`: Ajustes visuais para alertas Nível 5.

## Cronograma de Tarefas

### Fase 1: Análise & Infraestrutura
- [ ] **T-1.1:** Mapear pontos de deleção crítica para Snapshots de Pânico. [Agent: `backend-specialist`]
- [ ] **T-1.2:** Definir esquema de versionamento para o LocalStorage Mirror. [Agent: `database-architect`]

### Fase 2: Motor de Blindagem (Core Logic)
- [ ] **T-2.1:** Implementar `Auto-Rollback Shield` em `restoreSnapshot`. [Agent: `backend-specialist`]
    - INPUT: Snapshot ID → OUTPUT: Snapshot de Emergência + Restauração → VERIFY: Atividade registrada.
- [ ] **T-2.2:** Desenvolver `LocalStorage Mirroring` (Double-Write Strategy). [Agent: `backend-specialist`]
    - INPUT: Qualquer mudança de estado → OUTPUT: Sync Supabase + Sync LocalStorage → VERIFY: Dados no console.
- [ ] **T-2.3:** Criar sistema de Exportação/Importação `.sentinel`. [Agent: `backend-specialist`]
    - INPUT: Estado Global → OUTPUT: Download arquivo JSON → VERIFY: Arquivo baixado e reimportado com sucesso.

### Fase 3: UI Sentinel Nível 5
- [ ] **T-3.1:** Implementar Painel de Integridade na `SettingsPage`. [Agent: `frontend-specialist`]
    - OUTPUT: Indicador "Mirror Local: OK", Botões "Exportar Backup Externo" e "Importar Backup".
- [ ] **T-3.2:** Integrar Snapshots de Pânico em modais de deleção. [Agent: `frontend-specialist`]

### Fase 4: Verificação & Auditoria
- [ ] **T-4.1:** Testar restauração offline via Mirror Local. [Agent: `test-engineer`]
- [ ] **T-4.2:** Validar importação de arquivo `.sentinel` em nova sessão. [Agent: `test-engineer`]
- [ ] **T-4.3:** Auditoria de segurança final (`security_scan.py`). [Agent: `security-auditor`]

## Fase X: Verificação Final
- [ ] Lint: `npm run lint`
- [ ] Build: `npm run build`
- [ ] Security Status: `python .agent/scripts/checklist.py .`
