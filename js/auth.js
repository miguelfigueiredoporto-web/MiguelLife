// auth.js — gestão de autenticação Supabase
// Requer supabase.js configurado com credenciais reais

import { supabase, getSession, signOut } from './supabase.js';

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.replace('index.html');
    return null;
  }
  return session.user;
}

export async function redirectIfAuth() {
  const session = await getSession();
  if (session) {
    window.location.replace('dashboard.html');
  }
}

export async function handleSignOut() {
  await signOut();
  window.location.replace('index.html');
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
