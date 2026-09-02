-- Migration: permite marcar um imóvel como vendido
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

alter table properties
  add column if not exists data_venda date,
  add column if not exists valor_venda numeric;
