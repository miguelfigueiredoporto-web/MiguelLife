-- Migration: controlo de pagamento de rendas
-- Corre este ficheiro no Supabase Dashboard → SQL Editor → New query → Run

alter table properties
  add column if not exists dia_limite_pagamento int default 8;

create table if not exists pagamentos (
  id             uuid primary key default gen_random_uuid(),
  imovel_id      uuid references properties on delete cascade not null,
  mes            int not null check (mes between 1 and 12),
  ano            int not null,
  estado         text not null default 'pendente' check (estado in ('pago', 'pendente', 'atrasado')),
  data_pagamento date,
  valor_pago     numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (imovel_id, mes, ano)
);

alter table pagamentos enable row level security;

create policy "pagamentos_policy" on pagamentos
  for all using (
    exists (select 1 from properties p where p.id = pagamentos.imovel_id and p.user_id = auth.uid())
  );
