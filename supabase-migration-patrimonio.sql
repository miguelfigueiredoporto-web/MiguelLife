-- Migration: capital em dívida (preenchido manualmente) + histórico mensal de património
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

alter table properties
  add column if not exists financiamento_capital_divida numeric;

create table if not exists patrimonio_snapshots (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users on delete cascade not null,
  data_referencia     date not null,
  patrimonio_bruto    numeric not null,
  divida_bancaria     numeric not null,
  patrimonio_liquido  numeric not null,
  created_at          timestamptz default now(),
  unique (user_id, data_referencia)
);

alter table patrimonio_snapshots enable row level security;

create policy "patrimonio_snapshots_policy" on patrimonio_snapshots
  for all using (auth.uid() = user_id);
