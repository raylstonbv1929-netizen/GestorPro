# Plano: Protocolo de Blindagem Sentinel (Snapshots + Travas Críticas)

## Visão Geral
Implementação de um sistema de redundância de dados (Snapshots) e uma camada de proteção UI (Modais de Confirmação Técnica) para evitar perda de dados por erro humano.

## Tipo de Projeto
**WEB** (React + Supabase Native)

## Critérios de Sucesso
- [ ] Botão funcional de "Gerar Ponto de Restauração" nas configurações.
- [ ] Lista de pontos de restauração com data e hora.
- [ ] Função de "Rollback" (Restaurar) funcional e segura.
- [ ] Substituição do `confirm()` nativo por um modal estilizado em ações destrutivas.

---

## Fases do Projeto

### Fase 1: Motor de Snapshots (Backend/Context)
- **Objetivo:** Adicionar lógica de versionamento de estado no `AppContext`.
- **Agente:** `backend-specialist`
- **Tarefas:**
    - [ ] Criar tabela (virtual ou real via RPC se possível, ou usar registro de histórico na `user_data`) para snapshots.
    - [ ] Implementar `handleCreateSnapshot` em `AppContext`.
    - [ ] Implementar `handleRestoreSnapshot` com aviso de reinicialização.

### Fase 2: UI de Gerenciamento (Settings)
- **Objetivo:** Interface para controle dos snapshots.
- **Agente:** `frontend-specialist`
- **Tarefas:**
    - [ ] Criar seção "Protocolo Sentinel" na `SettingsPage`.
    - [ ] Exibir timeline de pontos de restauração.
    - [ ] Adicionar feedback visual de progresso durante o snapshot.

### Fase 3: Componente de Confirmação Crítica
- **Objetivo:** Trava de segurança visual.
- **Agente:** `frontend-specialist`
- **Tarefas:**
    - [ ] Criar `TechnicalConfirmModal.tsx` em `components/ui`.
    - [ ] Implementar padrão de design "Alerta Crítico" (Estilo Terminal/Militar).
    - [ ] Substituir pelo menos 3 pontos críticos de deleção (Produtos, Tarefas, Fluxo de Caixa).

---

## 🛠️ Detalhamento das Tarefas

| ID | Tarefa | Agente | Prioridade | Dependências |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Criar hook de histórico/snapshots no Supabase | `backend-specialist` | P0 | - |
| 2 | Refatorar `AppContext.tsx` para suporte a snapshot/rollback | `backend-specialist` | P0 | 1 |
| 3 | Desenvolver `TechnicalConfirmModal` | `frontend-specialist` | P1 | - |
| 4 | Implementar UI de snapshots na `SettingsPage` | `frontend-specialist` | P1 | 2 |
| 5 | Migrar deleções críticas para o novo modal | `frontend-specialist` | P2 | 3 |
| 6 | Auditoria de Segurança e Teste de Rollback | `test-engineer` | P0 | 5 |

---

## 🏁 Fase X: Verificação Final
- [ ] `npm run build` passa sem erros.
- [ ] Teste de restauração completa (validar se dados voltam ao estado anterior).
- [ ] Verificar se o modal técnico aparece em todas as deleções mapeadas.
- [ ] Execução de `python .agent/scripts/verify_all.py`.
