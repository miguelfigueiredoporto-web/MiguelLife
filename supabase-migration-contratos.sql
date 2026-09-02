-- Migration: histórico de inquilinos/contratos por imóvel
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

create table if not exists contratos (
  id             uuid primary key default gen_random_uuid(),
  imovel_id      uuid references properties on delete cascade not null,
  inquilino_nome text not null,
  renda_mensal   numeric,
  data_inicio    date not null,
  data_fim       date,
  notas          text,
  created_at     timestamptz default now()
);

alter table contratos enable row level security;

create policy "contratos_policy" on contratos
  for all using (
    exists (select 1 from properties p where p.id = contratos.imovel_id and p.user_id = auth.uid())
  );

-- Backfill: cria o contrato actual para imóveis já arrendados, a partir dos dados já existentes
insert into contratos (imovel_id, inquilino_nome, renda_mensal, data_inicio, data_fim)
select id, coalesce(inquilino_nome, 'Inquilino'), renda_mensal, data_inicio_contrato, null
from properties
where estado = 'arrendado'
  and data_inicio_contrato is not null
  and id not in (select imovel_id from contratos);
