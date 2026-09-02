-- Migration: liga despesas a um imóvel e permite anexar o PDF da fatura
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

alter table despesas
  add column if not exists imovel_id uuid references properties(id) on delete set null,
  add column if not exists fatura_path text;

-- Espaço de armazenamento para os PDFs das facturas (privado)
insert into storage.buckets (id, name, public)
values ('faturas', 'faturas', false)
on conflict (id) do nothing;

create policy "faturas_select" on storage.objects
  for select using (bucket_id = 'faturas' and auth.role() = 'authenticated');

create policy "faturas_insert" on storage.objects
  for insert with check (bucket_id = 'faturas' and auth.role() = 'authenticated');

create policy "faturas_delete" on storage.objects
  for delete using (bucket_id = 'faturas' and auth.role() = 'authenticated');
