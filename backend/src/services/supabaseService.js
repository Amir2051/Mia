import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser({ id, email, name, avatar_url, provider }) {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id, email, name, avatar_url, provider, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

// ── Conversations ─────────────────────────────────────────────────────────────
export async function createConversation(userId, title = 'New conversation') {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function updateConversationTitle(id, title) {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteConversation(id, userId) {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// ── Messages ──────────────────────────────────────────────────────────────────
export async function saveMessage({ conversation_id, role, content, tokens_used = 0 }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id, role, content, tokens_used })
    .select()
    .single();
  if (error) throw error;

  // Bump conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversation_id);

  return data;
}

export async function getConversationMessages(conversationId, limit = 100) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export default supabase;
