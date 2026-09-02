-- Migration: corrige as despesas de condomínio já registadas — cada pagamento é pontual,
-- não deve repetir-se todos os meses como "Fixo" (isso criava projeções fantasma em Despesas Mensais).
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

update despesas
set tipo = 'variavel'
where categoria = 'condominio' and tipo = 'fixo';
