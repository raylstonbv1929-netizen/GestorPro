# GestorPro 🚀

Sistema de Gestão Agrícola de alta performance.

## 🛠️ Tecnologias
- React + Vite
- Tailwind CSS
- Lucide React
- Supabase

## 🚀 Deploy no Vercel

Este projeto está pronto para ser implantado no Vercel. Siga os passos:

1. **Importe o Repositório**: Conecte seu GitHub ao Vercel e selecione este repositório.
2. **Configuração de Diretório**:
   - **Root Directory**: Defina como `GestorPro`.
3. **Variáveis de Ambiente**:
   No painel do Vercel, adicione as seguintes chaves em **Settings > Environment Variables**:
   - `VITE_SUPABASE_URL`: Sua URL do Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Sua Anon Key do Supabase.
4. **Build & Install**:
   - **Framework Preset**: Vite (Detectado automaticamente).
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.

## 📦 Desenvolvimento Local
1. Instale as dependências: `npm install`
2. Inicie o servidor: `npm run dev`
