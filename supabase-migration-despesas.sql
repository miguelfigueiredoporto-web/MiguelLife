-- Migration: módulo de Despesas Pessoais
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

create table if not exists despesas (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  nome          text not null,
  categoria     text default 'outros', -- 'agencias' | 'imoveis' | 'financas' | 'marca' | 'pessoal' | 'outros'
  tipo          text default 'fixo',   -- 'fixo' | 'variavel'
  valor_mensal  numeric,
  periodicidade text default 'mensal', -- 'mensal' | 'trimestral' | 'anual'
  ativo         boolean default true,
  notas         text,
  created_at    timestamptz default now()
);

alter table despesas enable row level security;

create policy "despesas_policy" on despesas
  for all using (auth.uid() = user_id);
