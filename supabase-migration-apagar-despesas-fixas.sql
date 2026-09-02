-- Apaga por completo (modelo + histórico) as despesas fixas: Restauração, Luz, Roupa, Viagens
-- Corre no Supabase Dashboard → SQL Editor → New query → Run

delete from despesas
where nome in ('Restauração', 'Luz', 'Roupa', 'Viagens');
