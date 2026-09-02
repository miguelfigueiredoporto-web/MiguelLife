// tarefas.js — CRUD tarefas

import { supabase } from './supabase.js';

export const CATEGORIAS = [
  { id: 'agencias',   label: 'Agências' },
  { id: 'imoveis',    label: 'Imóveis' },
  { id: 'financas',   label: 'Finanças Pessoais' },
  { id: 'marca',      label: 'Marca Pessoal' },
  { id: 'pessoal',    label: 'Pessoal / Família' },
  { id: 'outros',     label: 'Outros' },
];

export const PRIORIDADES = [
  { id: 'alta',  label: 'Alta',  class: 'tag-red' },
  { id: 'media', label: 'Média', class: 'tag-yellow' },
  { id: 'baixa', label: 'Baixa', class: 'tag-muted' },
];

export const ESTADOS = [
  { id: 'por_fazer',  label: 'Por fazer' },
  { id: 'em_curso',   label: 'Em curso' },
  { id: 'concluida',  label: 'Concluída' },
];

// ---- Fetch ----
export async function getTarefas(filtros = {}) {
  let q = supabase.from('tasks').select('*');

  if (filtros.estado)    q = q.eq('estado', filtros.estado);
  if (filtros.categoria) q = q.eq('categoria', filtros.categoria);
  if (filtros.prioridade) q = q.eq('prioridade', filtros.prioridade);

  q = q.order('prioridade', { ascending: true }).order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

// ---- Create / Update / Delete ----
export async function createTarefa(dados) {
  const { data, error } = await supabase.from('tasks').insert(dados).select().single();
  if (error) throw error;
  return data;
}

export async function updateTarefa(id, dados) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTarefa(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function mudarEstado(id, estado) {
  return updateTarefa(id, { estado });
}

// ---- Contagem para badge ----
export async function contarAbertas() {
  const { count, error } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .in('estado', ['por_fazer', 'em_curso'])
    .eq('prioridade', 'alta');
  if (error) return 0;
  return count;
}
