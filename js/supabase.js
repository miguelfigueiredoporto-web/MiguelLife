// ============================================================
// SUPABASE CLIENT
// Substitui SUPABASE_URL e SUPABASE_ANON_KEY pelas credenciais
// do teu projecto em https://supabase.com/dashboard
// ============================================================

const SUPABASE_URL  = 'https://yykxfvaxraqvumzpixjr.supabase.co';
const SUPABASE_ANON = 'sb_publishable_LMWVg87iISuEd8BRDogN0g_amyVMfVx';

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ---- Auth helpers ----

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

// ---- Generic DB helpers ----

export async function dbSelect(table, query = {}) {
  let req = supabase.from(table).select(query.select || '*');

  if (query.eq)     req = req.eq(...query.eq);
  if (query.order)  req = req.order(...query.order);
  if (query.limit)  req = req.limit(query.limit);

  const { data, error } = await req;
  if (error) throw error;
  return data;
}

export async function dbInsert(table, row) {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function dbUpdate(table, id, updates) {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function dbDelete(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}
