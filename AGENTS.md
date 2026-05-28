# Contexto do Projeto: Second Brain (Módulo Quadrante Segue-me)

## Visão Geral
Este sistema é o módulo de gestão de equipes do "Segue-me", integrado ao projeto maior "Second Brain". O objetivo principal é gerenciar o cadastro de equipes e seus integrantes, lidando com regras condicionais complexas (Jovens vs. Casais), e exportar o documento "Quadrante" em PDF com formatação rígida.

## Stack Tecnológica
- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript rigoroso
- **Estilização Front-end:** Tailwind CSS e Lucide Icons
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Geração de PDF:** `@react-pdf/renderer` (Client-side)
- **Ambiente Alvo de Desenvolvimento:** Linux (WSL) / Docker. Evitar dependências ou scripts exclusivos de Windows no `package.json`.

## Regras de Negócio (Domínio)
1. **Estrutura Hierárquica:**
   - **Equipes:** Agrupamento de nível mais alto (ex: Equipe Espiritualizadora, Equipe da Animação).
   - **Subcategorias (Híbrido):** Funções dentro das equipes. O formulário de cadastro usa um `<select>` com opções fixas (Casal coordenador, Jovens apoio, Jovens coordenadores, Casal apoio, Jovens membros, Casal tesoureiro) e uma opção "Outro". Se "Outro" for selecionado, um campo de texto é liberado para digitação manual. O banco de dados (`subcategory`) sempre salva isso como uma `String`.

2. **Tipos de Integrantes (Lógica de Casal vs. Jovem):**
   - **Jovem (Solteiro):**
     - Campos obrigatórios: Nome Completo, Apelido, Nascimento, Telefone, E-mail, Endereço.
   - **Casal:**
     - Campos compartilhados: Endereço, Telefone Residencial.
     - Campos Individuais (ELE): Nome, E-mail, Nascimento, Celular (Telefone).
     - Campos Individuais (ELA): Nome, E-mail, Nascimento, Celular (Telefone).

3. **Regras de Exportação (PDF via `@react-pdf/renderer`):**
   - **Formato Completo (Padrão Físico/Administrativo):**
     - **Design:** Deve replicar estritamente o padrão físico em caixas/tabelas densas. SEM layouts fluidos.
     - **Estilo:** Uso de bordas sólidas e pretas (`borderWidth: 1`, `borderColor: 'black'`) para criar grades simulando uma planilha impressa.
     - **Layout Casal:** Estrutura em grade. À esquerda (Nome ELE, E-Mail, Nome ELA, E-Mail, Endereço). À direita correspondente (Nascimento, Telefone, Nascimento, Telefone, Telefone Residencial).
     - **Layout Jovem:** Adaptar a grade densa mantendo Nome/Endereço à esquerda e Nascimento/Telefone à direita.
     - **Cabeçalho:** A subcategoria (texto) atua como título em negrito acima da sua respectiva tabela.
   - **Formato Reduzido (LGPD):**
     - Lista simples em texto, sem caixas densas, contendo APENAS: Nome, Apelido e Nascimento. Nivelado, ignorando o agrupamento de casais.

## Diretrizes de Arquitetura e Código (Vibe Coding)
- **Server vs Client Components:** Privilegie Server Components no App Router. Adicione `"use client"` estritamente em componentes com interatividade (formulários complexos com estado híbrido, botões de ação e exportação PDF).
- **Mutações de Dados:** Utilize **Server Actions** (`src/actions`) para toda comunicação de escrita com o Prisma (criação/edição de equipes e integrantes).
- **Validação:** Valide a lógica condicional do payload de integrantes rigorosamente usando Zod nas Server Actions (ex: garantir que campos de 'Ela' existam se o tipo for 'Casal').
- **Componentização UI:** Mantenha os formulários web limpos usando Tailwind, não é necessário simular as caixas densas do PDF na interface de preenchimento web. Foque na usabilidade do usuário.