# Task: Sincronização de Autenticação e Dados com Supabase

Substituir o login atual por uma experiência Premium e garantir que o banco de dados esteja configurado corretamente para o sistema de sincronização (cloud sync).

## 1. Configuração do Backend (Supabase SQL)
- [ ] Gerar script SQL para a tabela `user_data`.
- [ ] Configurar Políticas de RLS (Row Level Security).
- [ ] Adicionar trigger para `updated_at`.

## 2. Redesign da Tela de Login (Premium UI)
- [ ] Implementar Layout Assimétrico (Tech/Agro Style).
- [ ] Adicionar micro-interações e animações de entrada (staggered).
- [ ] Refinar feedback visual de erro e carregamento.

## 3. Validação de Conexão
- [ ] Verificar `src/lib/supabase.ts`.
- [ ] Testar fluxo de `SignUp` e `SignIn`.
- [ ] Validar persistência no `LocalStorage` via `AppContext`.

## 4. Finalização
- [ ] Auditoria de design (Maestro Audit).
- [ ] Testes finais de sincronismo.
