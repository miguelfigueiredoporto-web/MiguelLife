create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  nome       text,
  role       text default 'user',
  created_at timestamptz default now()
);

create table if not exists properties (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users on delete cascade not null,
  nome                    text not null,
  tipo                    text default 'residencial',
  data_aquisicao          date,
  valor_aquisicao         numeric,
  capital_proprio         numeric,
  financiamento_montante  numeric,
  financiamento_banco     text,
  financiamento_prestacao numeric,
  financiamento_taxa      numeric,
  financiamento_capital_divida numeric, -- capital em dívida actual, preenchido manualmente pelo Miguel
  custos_aquisicao        numeric,
  imi_anual               numeric,
  condominio_mensal       numeric,
  seguros_anuais          numeric,
  outros_custos_anuais    numeric,
  estado                  text default 'vazio',
  renda_mensal            numeric,
  data_inicio_contrato    date,
  inquilino_nome          text,
  regime_fiscal           text default 'taxa_autonoma',
  valor_mercado_atual     numeric,
  notas                   text,
  dia_limite_pagamento    int default 8,
  data_venda              date,
  valor_venda             numeric,
  created_at              timestamptz default now()
);

create table if not exists property_works (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references properties on delete cascade not null,
  descricao   text not null,
  valor       numeric,
  data        date,
  created_at  timestamptz default now()
);

create table if not exists income_sources (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  nome          text not null,
  tipo          text default 'fixo',
  valor_mensal  numeric,
  periodicidade text default 'mensal',
  ativo         boolean default true,
  notas         text,
  created_at    timestamptz default now()
);

create table if not exists income_history (
  id         uuid primary key default gen_random_uuid(),
  source_id  uuid references income_sources on delete cascade not null,
  ano        int not null,
  mes        int not null,
  valor      numeric,
  notas      text,
  created_at timestamptz default now(),
  unique(source_id, ano, mes)
);

create table if not exists despesas (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  nome          text not null,
  categoria     text default 'outros',
  tipo          text default 'fixo',
  valor_mensal  numeric,
  periodicidade text default 'mensal',
  data          date default current_date,
  ativo         boolean default true,
  template_id   uuid references despesas(id) on delete cascade,
  imovel_id     uuid references properties(id) on delete set null,
  fatura_path   text,
  notas         text,
  created_at    timestamptz default now()
);

create table if not exists contratos (
  id             uuid primary key default gen_random_uuid(),
  imovel_id      uuid references properties on delete cascade not null,
  inquilino_nome text not null,
  renda_mensal   numeric,
  data_inicio    date not null,
  data_fim       date,
  caucao         numeric,
  notas          text,
  created_at     timestamptz default now()
);

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

create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  titulo     text not null,
  categoria  text,
  prioridade text default 'media',
  data_limite date,
  estado     text default 'por_fazer',
  notas      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Histórico mensal de património (Dashboard → Evolução do Património), um snapshot por mês
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

alter table profiles             enable row level security;
alter table properties           enable row level security;
alter table property_works       enable row level security;
alter table income_sources       enable row level security;
alter table income_history       enable row level security;
alter table despesas             enable row level security;
alter table contratos            enable row level security;
alter table pagamentos           enable row level security;
alter table tasks                enable row level security;
alter table patrimonio_snapshots enable row level security;

create policy "profiles_policy" on profiles
  for all using (auth.uid() = id);

create policy "properties_policy" on properties
  for all using (auth.uid() = user_id);

create policy "property_works_policy" on property_works
  for all using (
    exists (select 1 from properties p where p.id = property_works.property_id and p.user_id = auth.uid())
  );

create policy "income_sources_policy" on income_sources
  for all using (auth.uid() = user_id);

create policy "income_history_policy" on income_history
  for all using (
    exists (select 1 from income_sources s where s.id = income_history.source_id and s.user_id = auth.uid())
  );

create policy "despesas_policy" on despesas
  for all using (auth.uid() = user_id);

create policy "tasks_policy" on tasks
  for all using (auth.uid() = user_id);

create policy "patrimonio_snapshots_policy" on patrimonio_snapshots
  for all using (auth.uid() = user_id);

create policy "pagamentos_policy" on pagamentos
  for all using (
    exists (select 1 from properties p where p.id = pagamentos.imovel_id and p.user_id = auth.uid())
  );

create policy "contratos_policy" on contratos
  for all using (
    exists (select 1 from properties p where p.id = contratos.imovel_id and p.user_id = auth.uid())
  );

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, nome)
  values (new.id, new.raw_user_meta_data->>'nome');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Espaço de armazenamento para os PDFs das facturas das despesas (privado)
insert into storage.buckets (id, name, public)
values ('faturas', 'faturas', false)
on conflict (id) do nothing;

create policy "faturas_select" on storage.objects
  for select using (bucket_id = 'faturas' and auth.role() = 'authenticated');

create policy "faturas_insert" on storage.objects
  for insert with check (bucket_id = 'faturas' and auth.role() = 'authenticated');

create policy "faturas_delete" on storage.objects
  for delete using (bucket_id = 'faturas' and auth.role() = 'authenticated');
