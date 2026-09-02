-- Migration: liga cada despesa confirmada à despesa fixa que a gerou
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

alter table despesas
  add column if not exists template_id uuid references despesas(id) on delete cascade;
