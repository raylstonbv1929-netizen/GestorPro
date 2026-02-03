---
title: Implementação do Scanner AI Sentinel para Comprovantes Financeiros
status: completed
agent: frontend-specialist
skills: ["frontend-design", "clean-code", "systematic-debugging"]
---

# 🎯 Objetivo
Adicionar uma funcionalidade de "Scanner Digital" na página financeira que permita ao usuário tirar uma foto ou fazer upload de um comprovante, extraindo automaticamente Data, Valor e Descrição utilizando OCR local (Tesseract.js).

# 🏗️ Arquitetura
- **OCR Engine:** `tesseract.js` (Processamento local no navegador).
- **UI:** Botão "Sentinel Vision" no Command Center financeiro.
- **Fluxo:** Upload -> Processamento -> Validação HUD (Correção manual se necessário) -> Commit para o formulário.

# 📝 Tarefas

## Fase 1: Infraestrutura
- [ ] Instalar `tesseract.js` via npm.
- [ ] Criar utilitário de processamento de texto `src/utils/ocr-parser.ts` para extração via Regex.

## Fase 2: Componentização
- [ ] Criar `src/components/finance/ReceiptScanner.tsx` com interface industrial.
- [ ] Implementar feedback visual de "Scanning" com animações de varredura.

## Fase 3: Integração
- [ ] Integrar o Scanner na `FinancePage.tsx`.
- [ ] Mapear os dados extraídos para o estado do formulário (`form`).
- [ ] Testar com amostras de comprovantes comuns (Pix, NF-e, Recibos).

# 🛠️ Critérios de Aceite
- O scanner deve identificar valores monetários no formato brasileiro (R$, ,).
- O scanner deve identificar datas no formato DD/MM/AAAA ou YYYY-MM-DD.
- A interface deve manter o estilo "Sentinel" (Escuro, bordas vivas, cores de sinalização).
- Não deve haver erros de carregamento de recursos externos do Tesseract (ajuste de workers).
