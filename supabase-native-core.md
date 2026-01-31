# Plano: Supabase Native Core (100% Online)

## Visão Geral
Migração do sistema de armazenamento híbrido (LocalStorage + JSON Blob) para um modelo **Supabase Native**, onde o Supabase é a única fonte de verdade e as operações são realizadas em tempo real.

## Tipo de Projeto
**WEB** (Next.js + Supabase)

## Critérios de Sucesso
- [ ] Remoção completa da dependência do LocalStorage para estados core.
- [ ] Sincronização instantânea (Realtime) entre múltiplos dispositivos.
- [ ] Latência de interface mínima através de atualizações otimistas.
- [ ] Sistema 100% funcional sem arquivos locais.

## Tech Stack
- **Banco de Dados:** Supabase (PostgreSQL)
- **Realtime:** Supabase Broadcast/Presence
- **Gerenciamento de Estado:** React Context API (Refatorado)
- **Segurança:** Supabase RLS (Row Level Security)

---

## Fases do Projeto

### Fase 1: Análise e Preparação de Dados
- **Objetivo:** Mapear todas as entidades e preparar a migração.
- **Agente:** `explorer-agent`
- **Tarefas:**
    - [ ] Mapear todas as chaves do `useStickyState` em `AppContext.tsx`.
    - [ ] Identificar dependências entre entidades (ex: Movimentação -> Produto).

### Fase 2: Infraestrutura de Dados (Nativo)
- **Objetivo:** Definir a nova estratégia de persistência rápida.
- **Agente:** `backend-specialist`
- **Tarefas:**
    - [ ] Refatorar `supabase.ts` para otimizar conexões.
    - [ ] Criar hooks de mutação instantânea para o Supabase.

### Fase 3: Refatoração do AppContext
- **Objetivo:** Eliminar o LocalStorage e implementar o fluxo 100% online.
- **Agente:** `backend-specialist`
- **Tarefas:**
    - [ ] Substituir `useStickyState` por `useState` + `useEffect` (fetch inicial do Supabase).
    - [ ] Implementar `syncToCloud` granular (salvar apenas o que mudou).
    - [ ] Adicionar indicador visual de "Sync Online/Realtime" no header.

### Fase 4: Sincronização Realtime
- **Objetivo:** Garantir que mudanças em um dispositivo apareçam no outro instantaneamente.
- **Agente:** `frontend-specialist`
- **Tarefas:**
    - [ ] Configurar listeners de Realtime para todas as tabelas/canais.
    - [ ] Implementar atualizações de estado baseadas em payloads do Supabase.

---

## 🛠️ Detalhamento das Tarefas

| ID | Tarefa | Agente | Prioridade | Dependências |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Mapear entidades e chaves de estado | `explorer-agent` | P0 | - |
| 2 | Refatorar `AppContext.tsx` para carregar dados APENAS do Supabase | `backend-specialist` | P0 | 1 |
| 3 | Criar lógica de mutação individual (não-blob) para entidades críticas | `backend-specialist` | P1 | 2 |
| 4 | Implementar UI de status de sincronização no `GlobalHeader` | `frontend-specialist` | P2 | 2 |
| 5 | Configurar Realtime Subscriptions para atualizações dinâmicas | `frontend-specialist` | P1 | 2 |
| 6 | Verificação Geral e Testes de Latência | `test-engineer` | P0 | 5 |

---

## 🏁 Fase X: Verificação Final
- [ ] `npm run build` passa sem erros.
- [ ] Teste de concorrência (duas abas abertas sincronizando).
- [ ] Verificação de redundância (nenhum dado salvo no LocalStorage).
- [ ] Execução de `python .agent/scripts/verify_all.py`.

---

**Caminho de Rollback:**
- Manter as chaves `agrogest_` no LocalStorage comentadas caso seja necessário reverter para modo híbrido.
