-- Migration: remove o módulo ETFs (já não existe na app)
-- Corre no Supabase Dashboard → SQL Editor → New query → Run
-- ATENÇÃO: isto apaga definitivamente as tabelas e quaisquer dados lá guardados.

drop table if exists etf_purchases;
drop table if exists etf_positions;
