// imoveis.js — CRUD imóveis

import { supabase } from './supabase.js';
import { formatEUR, formatPct, calcYieldBruta, calcYieldLiquida, calcMaisValia } from './utils.js';

// ---- Fetch ----
export async function getImoveis() {
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_works(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getImovel(id) {
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_works(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// ---- Create / Update / Delete ----
export async function createImovel(dados) {
  const { data, error } = await supabase.from('properties').insert(dados).select().single();
  if (error) throw error;
  return data;
}

export async function updateImovel(id, dados) {
  const { data, error } = await supabase.from('properties').update(dados).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteImovel(id) {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
}

// ---- Obras ----
export async function addObra(propertyId, obra) {
  const { data, error } = await supabase.from('property_works').insert({ property_id: propertyId, ...obra }).select().single();
  if (error) throw error;
  return data;
}

// ---- Cálculos ----
export function calcularImovel(im) {
  const custosAnuais = ((im.condominio_mensal || 0) * 12) + (im.imi_anual || 0) + (im.seguros_anuais || 0) + (im.outros_custos_anuais || 0);
  const totalObras   = (im.property_works || []).reduce((s, o) => s + (o.valor || 0), 0);

  return {
    custosAnuais,
    totalObras,
    yieldBruta:   calcYieldBruta(im.renda_mensal, im.valor_aquisicao),
    yieldLiquida: calcYieldLiquida(im.renda_mensal, custosAnuais, 0.28, im.capital_proprio),
    maisValia:    calcMaisValia(im.valor_mercado_atual || 0, im.valor_aquisicao, im.custos_aquisicao, totalObras),
    rendaLiquida: im.renda_mensal ? im.renda_mensal * 12 * (1 - 0.28) : null,
  };
}
