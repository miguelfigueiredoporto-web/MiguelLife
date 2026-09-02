-- Migration: adiciona o valor da caução a cada contrato de arrendamento
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

alter table contratos
  add column if not exists caucao numeric;
