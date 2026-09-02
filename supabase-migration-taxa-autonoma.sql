-- Migration: coloca todos os imóveis arrendados no regime "Taxa autónoma"
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

update properties
set regime_fiscal = 'taxa_autonoma'
where estado = 'arrendado';
