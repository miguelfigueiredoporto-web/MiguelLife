-- Migration: adiciona data a cada despesa, para poderes filtrar por mês/ano
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

alter table despesas
  add column if not exists data date default current_date;

update despesas set data = created_at::date where data is null;
