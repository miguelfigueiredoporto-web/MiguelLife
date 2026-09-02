# CLAUDE.md — Miguel Personal HQ

## Visão Geral do Projeto

App web pessoal para gestão financeira e de vida do Miguel. Funciona como um "escritório pessoal" centralizado que substitui todos os Google Sheets. Acesso via browser no telemóvel e desktop. Dois utilizadores: Miguel + parceira/familiar.

**Objetivo principal:** Saber a qualquer momento quanto dinheiro entra, sai, quanto tenho investido e onde — com clareza e sem esforço.

---

## Stack Técnico

| Camada | Tecnologia |
|---|---|
| Frontend | HTML + CSS + Vanilla JS (mobile-first, PWA-ready) |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Deploy | Vercel |
| Auth | Supabase Auth — email + password |
| Moeda | EUR (€) |

**Notas de stack:**
- Manter simples: sem frameworks pesados (sem React, sem Vue) para facilitar manutenção
- Mobile-first: tudo tem de funcionar perfeitamente no telemóvel como se fosse uma app
- PWA opcional mas desejável: permitir "Add to Home Screen" no iOS/Android
- Sem dependências desnecessárias

---

## Utilizadores e Autenticação

- 2 utilizadores: `miguel` (admin) e `parceira` (acesso partilhado)
- Login via email + password (Supabase Auth)
- Ambos veem e editam tudo (sem permissões diferenciadas por agora)
- Sessão persistente — não pedir login a cada visita

---

## Módulos da App

### 1. Dashboard (Página Inicial)
Vista geral de tudo. Deve responder imediatamente às perguntas:
- **Quanto dinheiro entra este mês?** (soma de todas as rendas/rendimentos)
- **Quanto sai?** (condomínios, IMI, seguros, outros custos fixos, despesas pessoais)
- **Saldo líquido mensal estimado**
- **Património total** (valor de mercado dos imóveis)

Componentes:
- Cards de resumo: Rendimento Mensal | Despesas Fixas | Saldo Mensal | Património Total
- Gráfico de barras: Rendimentos vs Despesas dos últimos 6 meses
- Atalhos rápidos para cada módulo
- Design: glassmorphism (fundo claro com "luz ambiente" desfocada, cards em vidro fosco translúcido)

---

### 2. Imóveis
Registo e acompanhamento de cada imóvel de investimento.

**Campos por imóvel:**
- Nome / Descrição (ex: "T2 Porto — Rua X")
- Tipo: Residencial / Comercial / Terreno
- Data de aquisição
- Valor de aquisição
- Capital próprio aplicado (entrada)
- Financiamento (montante, banco, prestação mensal, taxa)
- Custos de aquisição (IMT, Imposto de Selo, notário, etc.)
- Obras realizadas (lista com valor e data)
- Condomínio mensal
- IMI anual
- Seguros anuais
- Outros custos anuais
- Estado: Arrendado / Vazio / Uso próprio / Vendido
- Se arrendado:
  - Valor da renda mensal
  - Data início do contrato
  - Nome do inquilino (opcional)
  - Caução paga (por contrato, editável na secção Arrendamento do imóvel)
  - Imposto sobre rendas (categoria F — 19% taxa autónoma ou englobamento)
  - Renda líquida após imposto (calculado automaticamente)
  - Lista de meses do contrato (desde o início até hoje) em que se pode marcar cada mês como pago/pendente — usa a mesma tabela `pagamentos` da secção Arrendamentos, por isso o estado fica sempre sincronizado entre as duas páginas
- Valor de mercado estimado atual (para calcular mais-valia latente)
- Se vendido: data de venda, valor de venda

**Vistas:**
- Lista de todos os imóveis com resumo (renda, custos, yield)
- Detalhe de cada imóvel
- Indicadores calculados automaticamente:
  - Yield bruta = renda anual / (valor de aquisição + custos de aquisição + obras realizadas)
  - Yield líquida = (renda anual - custos anuais - imposto) / capital próprio aplicado
  - Mais-valia latente = valor mercado atual - (valor aquisição + custos + obras)
  - Mais-valia realizada = valor de venda - (valor aquisição + custos + obras)

**Venda de imóveis:**
Botão "Vender" na página de detalhe do imóvel (separado do "Editar") pede data e valor de venda. Ao confirmar: marca `estado = 'vendido'`, fecha o contrato de arrendamento activo (se existir) e o imóvel deixa de contar para o Património Total e Despesas Fixas do Dashboard — mas continua visível na lista (a cinzento, ordenado para o fim) com a mais-valia realizada.

---

### 3. Rendimentos
Registo de todas as fontes de receita do Miguel.

**Fontes a registar:**
- Rendas dos imóveis (puxadas automaticamente do módulo Imóveis)
- Distribuições das agências imobiliárias (RE/MAX We Go — pode ser variável)
- Outros rendimentos (consultorias, marca pessoal, etc.)

**Campos por fonte:**
- Nome da fonte
- Tipo: Fixo / Variável
- Valor mensal (ou média mensal se variável)
- Periodicidade: Mensal / Trimestral / Anual
- Notas

**Vista:**
- Tabela com todas as fontes + total mensal e anual
- Histórico mensal (registo manual do que realmente entrou)

---

### 4. Tarefas
Sistema simples de tarefas por categoria, para uso diário.

**Categorias:**
- Agências (RE/MAX We Go)
- Imóveis
- Finanças Pessoais
- Marca Pessoal
- Pessoal / Família
- Outros

**Campos por tarefa:**
- Título
- Categoria
- Prioridade: Alta / Média / Baixa
- Data limite (opcional)
- Estado: Por fazer / Em curso / Concluída
- Notas

**Vista:**
- Kanban simples (Por fazer | Em curso | Concluída) com filtro por categoria
- Vista de lista com filtros
- Badge no menu com tarefas abertas de alta prioridade

---

### 5. Despesas Mensais
Registo tipo extracto das despesas pessoais/da empresa, não ligadas a um imóvel específico (ex: subscrições, seguros pessoais, custos de escritório). Cada despesa tem a sua própria data — não é uma lista fixa de recorrências, é um livro de registo que o Miguel vai preenchendo à medida que gasta.

Uma despesa pode opcionalmente ficar associada a um imóvel (`imovel_id`) e ter uma factura em PDF anexada (guardada no Supabase Storage, bucket `faturas`, privado — acedido via signed URL). Na página de detalhe de cada imóvel há um botão "Nova Despesa" que já cria a despesa pré-associada a esse imóvel (categoria "Imóveis"), e um cartão dedicado "Condomínio" (com o seu próprio botão "+") para registar despesas de condomínio por data com PDF anexado (categoria "Condomínio"); essas despesas também aparecem na lista geral em Despesas Mensais.

**Campos por despesa:**
- Nome
- Categoria: campo de texto livre com sugestões (Casa, Supermercado, Restauração, Pessoal, Família, Lazer & Viagens, Subscrições, Outros) — pode escrever-se uma categoria nova. "Imóveis" e "Condomínio" continuam a existir como categorias, mas só são criadas automaticamente a partir da página de cada imóvel (não são sugeridas aqui)
- Tipo: Fixo / Variável
- Valor
- Data (filtrável por mês/ano)
- Periodicidade: Mensal / Trimestral / Anual (só informativo)
- Activa (boolean)
- Notas

**Vista:**
- Filtro por mês/ano (por defeito mostra o mês corrente)
- Cards de resumo do período filtrado: Total | Fixas | Variáveis | Nº de Despesas
- Tabela com todas as despesas do período, editar/apagar
- Despesas do mês corrente entram no cálculo de "Despesas Fixas" do Dashboard

**Projecção de despesas fixas:**
Uma despesa "Fixo" e activa projecta-se automaticamente para o mês corrente e meses futuros seguintes (respeitando a periodicidade), aparecendo como "Pendente — confirmar" até o Miguel clicar para confirmar — nesse momento cria-se um registo real desse mês (ligado à despesa original via `template_id`). Só é calculada quando um mês e ano específicos estão seleccionados nos filtros (não em "Todos os meses/anos").

---

## Design e UX

### Princípios
- **Mobile-first**: navegação por tab bar em baixo no telemóvel; sidebar no desktop
- **Clareza acima de tudo**: números grandes, legíveis, sem ruído visual
- **Velocidade**: cada página carrega em < 1 segundo
- **Consistência**: mesmos padrões de UI em todos os módulos

### Estética
- Tema escuro por defeito (mais agradável à noite e no telemóvel)
- Paleta: fundo muito escuro (#0f0f13), cards com leve elevação, accent em verde esmeralda (#22c55e) para valores positivos, vermelho suave (#ef4444) para negativos/custos
- Tipografia limpa e moderna — sem serif, boa legibilidade em tamanho pequeno
- Ícones: Lucide Icons (via CDN)
- Gráficos: Chart.js (via CDN)

### Navegação
```
Tab Bar (mobile) / Sidebar (desktop):
🏠 Dashboard
🏘️ Imóveis
💶 Rendimentos
💸 Despesas
✅ Tarefas
⚙️ Definições
```

---

## Base de Dados Supabase

### Tabelas principais

```sql
-- Utilizadores (geridos pelo Supabase Auth)
-- profiles: id, email, nome, role

-- Imóveis
properties (
  id uuid primary key,
  user_id uuid references auth.users,
  nome text,
  tipo text, -- 'residencial' | 'comercial' | 'terreno'
  data_aquisicao date,
  valor_aquisicao numeric,
  capital_proprio numeric,
  financiamento_montante numeric,
  financiamento_banco text,
  financiamento_prestacao numeric,
  financiamento_taxa numeric,
  custos_aquisicao numeric, -- IMT + IS + notário
  imi_anual numeric,
  condominio_mensal numeric,
  seguros_anuais numeric,
  outros_custos_anuais numeric,
  estado text, -- 'arrendado' | 'vazio' | 'uso_proprio'
  renda_mensal numeric,
  data_inicio_contrato date,
  inquilino_nome text,
  regime_fiscal text, -- 'taxa_autonoma' | 'englobamento'
  valor_mercado_atual numeric,
  notas text,
  created_at timestamptz default now()
)

-- Obras por imóvel
property_works (
  id uuid primary key,
  property_id uuid references properties,
  descricao text,
  valor numeric,
  data date,
  created_at timestamptz default now()
)

-- Fontes de rendimento
income_sources (
  id uuid primary key,
  user_id uuid references auth.users,
  nome text,
  tipo text, -- 'fixo' | 'variavel'
  valor_mensal numeric,
  periodicidade text, -- 'mensal' | 'trimestral' | 'anual'
  ativo boolean default true,
  notas text,
  created_at timestamptz default now()
)

-- Histórico de rendimentos reais
income_history (
  id uuid primary key,
  source_id uuid references income_sources,
  ano int,
  mes int,
  valor numeric,
  notas text,
  created_at timestamptz default now()
)

-- Despesas mensais (pessoais / empresa) — registo tipo extracto, uma linha por despesa com data própria
despesas (
  id uuid primary key,
  user_id uuid references auth.users,
  nome text,
  categoria text, -- 'agencias' | 'imoveis' | 'financas' | 'marca' | 'pessoal' | 'outros'
  tipo text, -- 'fixo' | 'variavel'
  valor_mensal numeric, -- valor desta despesa específica
  data date default current_date, -- filtrável por mês/ano em despesas.html
  periodicidade text, -- 'mensal' | 'trimestral' | 'anual' (informativo)
  ativo boolean default true,
  notas text,
  created_at timestamptz default now()
)

-- Tarefas
tasks (
  id uuid primary key,
  user_id uuid references auth.users,
  titulo text,
  categoria text,
  prioridade text, -- 'alta' | 'media' | 'baixa'
  data_limite date,
  estado text default 'por_fazer', -- 'por_fazer' | 'em_curso' | 'concluida'
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

### Row Level Security (RLS)
- Ativar RLS em todas as tabelas
- Policy: utilizador só vê os seus próprios dados (`user_id = auth.uid()`)
- Ambos os utilizadores (Miguel + parceira) partilham dados via uma tabela `households` ou via acesso partilhado explícito — definir na fase de implementação

---

## Estrutura de Ficheiros

```
/
├── index.html              # Login / redirect
├── dashboard.html          # Dashboard principal
├── imoveis.html            # Lista de imóveis
├── imovel-detalhe.html     # Detalhe de um imóvel
├── rendimentos.html        # Fontes de rendimento
├── despesas.html           # Despesas mensais
├── tarefas.html            # Gestão de tarefas
├── definicoes.html         # Definições da conta
├── css/
│   ├── base.css            # Reset, variáveis, tipografia
│   ├── components.css      # Cards, botões, formulários, tabelas
│   └── layout.css          # Nav, sidebar, grid
├── js/
│   ├── supabase.js         # Cliente Supabase + helpers de auth
│   ├── auth.js             # Login, logout, proteção de rotas
│   ├── dashboard.js        # Lógica do dashboard
│   ├── imoveis.js          # CRUD imóveis
│   ├── rendimentos.js      # CRUD rendimentos
│   ├── tarefas.js          # CRUD tarefas
│   └── utils.js            # Formatadores (€, %, datas), helpers
└── CLAUDE.md               # Este ficheiro
```

---

## Convenções de Código

- **Sem frameworks**: HTML + CSS + JS puro para simplicidade máxima
- **Modular**: cada página tem o seu JS próprio; lógica partilhada em `utils.js`
- **Supabase client**: inicializado uma vez em `supabase.js`, importado via `<script type="module">`
- **Proteção de rotas**: todas as páginas exceto `index.html` verificam sessão no topo do JS
- **Formatação monetária**: sempre usar `formatEUR(valor)` de `utils.js` → ex: "1.250,00 €"
- **Erros**: sempre mostrar mensagem de erro visível ao utilizador; nunca falhar silenciosamente
- **Loading states**: mostrar skeleton ou spinner enquanto carregam dados do Supabase

---

## Ordem de Desenvolvimento Sugerida

1. **Setup base**: Supabase project + Auth + tabelas SQL + Vercel deploy
2. **Auth**: login/logout + proteção de rotas + sessão persistente
3. **Layout base**: nav mobile + desktop, CSS variables, componentes base
4. **Módulo Tarefas**: o mais simples — bom para testar o padrão CRUD
5. **Módulo Imóveis**: o mais complexo — fazer bem aqui define o padrão
6. **Módulo Rendimentos**
7. **Módulo Despesas**
8. **Dashboard**: agrega dados de todos os módulos
9. **Polish**: PWA manifest, refinamentos UX, testes no telemóvel

---

## Contexto do Miguel (para decisões de produto)

- Dono/broker de 2 agências RE/MAX em Portugal (RE/MAX We Go)
- Tem imóveis arrendados (rendimentos categoria F — taxa autónoma 19% ou englobamento)
- Investe em ETFs
- Investe na sua marca pessoal
- Quer largar os Google Sheets de vez
- Usa principalmente o telemóvel
- Não é developer — a app tem de ser simples de usar e de manter
- Parceira também usa a app

---

## Notas para o Claude (assistente de desenvolvimento)

- Quando criares uma nova página, segue sempre a estrutura de ficheiros definida acima
- Verifica sempre se o utilizador está autenticado antes de mostrar qualquer dado
- Os cálculos financeiros (yields, mais-valias, impostos) devem ser transparentes — mostrar sempre a fórmula usada ou uma tooltip explicativa
- O imposto sobre rendas de imóveis usado nesta app é 19% sobre o valor bruto da renda (taxa autónoma) ou englobamento — o Miguel escolhe por imóvel
- Prioriza sempre a experiência mobile: testa mentalmente cada UI num ecrã de 390px de largura
- Quando tiveres dúvidas sobre requisitos, pergunta antes de implementar
