# Task: Refinamento Tático do Console de Filtros - FieldApplicationsPage

## Objetivo
Transformar a janela de filtro da página de Aplicações em uma interface tática premium (Command Center), focando em estética militar, precisão técnica e micro-interações de alta tecnologia, conforme o workflow `ui-ux-pro-max`.

## Análise de Design (Deep Design Thinking)
- **Sector:** Ag-Tech / Logistics.
- **Emotion:** Precisão, Controle, Autoridade Técnica.
- **Aesthetic:** Tactical HUD / Military Console.
- **Geometry:** Borda afiada (0px - 2px) para reforçar o aspecto de "instrumento de precisão".
- **Color Palette:** 
  - Base: `slate-950`
  - Bordas: `slate-800` com transparência
  - Accents: `cyan-500` (Ativo), `orange-500` (Atenção/Reset), `emerald-500` (Confirmado)
  - Ban Purple: ✅ (Nenhum roxo será utilizado)

## Plano de Implementação

### Fase 1: Estrutura Topológica (Betraying the Modal habit)
- [ ] Substituir o modal genérico por um layout de "Command Console" fragmentado.
- [ ] Adicionar um `Tactical Grid` de fundo com maior profundidade (parallax ou efeito de grão).
- [ ] Implementar "Corner Brackets" dinâmicos que pulsam ou rastreiam o foco.

### Fase 2: Componentes Táticos
- [ ] **Inputs:** Remover bordas arredondadas. Usar estilo "Digital Display" com etiquetas pequenas e código de identificação (ex: [REF-SEARCH]).
- [ ] **Seletores:** Transformar selects padrão em "Toggle Matrix" ou botões táticos se as opções forem limitadas.
- [ ] **Telemetria:** Refinar o painel lateral para parecer um "Data Core" com animações de streaming de números.

### Fase 3: Micro-interações e Efeitos
- [ ] **Reveal:** Entrada em camadas com atraso (staggered) usando `framer-motion` (ou apenas Tailwind animations se preferível, mas manteremos o espírito "Spring Physics").
- [ ] **Hover:** Feedback físico real (brilho sutil no texto, mudança de tom na borda).
- [ ] **Scanner Line:** Refinar a linha de laser para ser mais suave e integrada aos elementos da UI.

### Fase 4: Verificação Final
- [ ] Testar contraste em modo escuro.
- [ ] Garantir que o "Spirit" de elite seja mantido (Nada de emojis, nada de curvas "fofas").
