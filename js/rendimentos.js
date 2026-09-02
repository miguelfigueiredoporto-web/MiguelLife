// rendimentos.js — CRUD fontes de rendimento e histórico

import { supabase } from './supabase.js';

export async function getFontes() {
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createFonte(dados) {
  const { data, error } = await supabase.from('income_sources').insert(dados).select().single();
  if (error) throw error;
  return data;
}

export async function updateFonte(id, dados) {
  const { data, error } = await supabase.from('income_sources').update(dados).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFonte(id) {
  const { error } = await supabase.from('income_sources').update({ ativo: false }).eq('id', id);
  if (error) throw error;
}

// ---- Histórico ----
export async function getHistorico(sourceId) {
  const { data, error } = await supabase
    .from('income_history')
    .select('*')
    .eq('source_id', sourceId)
    .order('ano', { ascending: false });
  if (error) throw error;
  return data;
}

export async function registarMes(sourceId, ano, mes, valor, notas = '') {
  const { data, error } = await supabase
    .from('income_history')
    .upsert({ source_id: sourceId, ano, mes, valor, notas }, { onConflict: 'source_id,ano,mes' })
    .select().single();
  if (error) throw error;
  return data;
}

// ---- Cálculos ----
export function totalMensal(fontes) {
  return fontes.reduce((sum, f) => {
    const mensal = f.periodicidade === 'anual'      ? f.valor_mensal / 12
                 : f.periodicidade === 'trimestral' ? f.valor_mensal / 3
                 : f.valor_mensal;
    return sum + (mensal || 0);
  }, 0);
}
