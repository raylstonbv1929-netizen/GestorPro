-- ==========================================
-- SCRIPT DE CONFIGURAÇÃO DO GESTORPRO
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- 1. Criar tabela de sincronização de dados do usuário
CREATE TABLE IF NOT EXISTS public.user_data (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Segurança em nível de linha)
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de Acesso
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own data') THEN
        CREATE POLICY "Users can view their own data" ON public.user_data
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own data') THEN
        CREATE POLICY "Users can insert their own data" ON public.user_data
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own data') THEN
        CREATE POLICY "Users can update their own data" ON public.user_data
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Função para atualizar o timestamp automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Trigger para disparar a função
DROP TRIGGER IF EXISTS update_user_data_updated_at ON public.user_data;
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON public.user_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
