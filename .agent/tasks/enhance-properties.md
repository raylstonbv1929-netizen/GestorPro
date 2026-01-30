# Task: Refatoração Premium - Página de Propriedades (Industrial Data-Tech)

## Descrição
Transformar a página de Propriedades em uma interface de alta fidelidade técnica, adotando o estilo "Industrial Sharp", foco em métricas (Data-tech) e experiência de Drill-down.

## Critérios de Aceite
- [ ] Geometria Sharp (border-radius: 2px).
- [ ] Interface de Drill-down: Grid de Propriedades -> Visão Detalhada.
- [ ] Header Técnico com métricas agregadas (Total ha, Cultivado vs Total).
- [ ] Estética Industrial: Linhas de grade, fontes mono para números, contrastes elevados.
- [ ] Preservação de funcionalidades (CRUD, Anexos, Supabase).

## Mudanças Arquiteturais
- Adição de estado `selectedPropertyId` para alternar entre Grid e Detalhes.
- Refatoração dos componentes internos para adotar o novo subsistema de design.

## Plano de Ação
1. **Fase 1**: Atualizar `PropertiesPage` para suportar modo Drill-down.
2. **Fase 2**: Implementar Header de Métricas Industriais.
3. **Fase 3**: Criar Grid de Propriedades (Estilo Lobby Técnico).
4. **Fase 4**: Criar Visão Deep-Dive para Propriedade Selecionada.
5. **Fase 5**: Polimento visual e de animações (micro-interactions).
