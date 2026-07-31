import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials (Fallback to environment variables if set)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xcznqwpmqkxstptwmlae.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjem5xd3BtcWt4c3RwdHdtbGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkyMTYwMDAsImV4cCI6MjAyNDc5MjAwMH0.dummyKey';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * SQL Schema script to run in Supabase SQL Editor if tables do not exist yet:
 * 
 * CREATE TABLE IF NOT EXISTS conversations (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   messages JSONB NOT NULL DEFAULT '[]'::jsonb,
 *   pinned BOOLEAN DEFAULT false,
 *   category TEXT DEFAULT 'Unassigned',
 *   created_at BIGINT NOT NULL,
 *   updated_at BIGINT NOT NULL
 * );
 * 
 * CREATE TABLE IF NOT EXISTS tasks (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   completed BOOLEAN DEFAULT false,
 *   created_at BIGINT NOT NULL,
 *   due_date BIGINT,
 *   priority TEXT DEFAULT 'medium'
 * );
 */

export async function syncConversationToSupabase(userId: string, conv: any) {
  try {
    const { error } = await supabase.from('conversations').upsert({
      id: conv.id,
      user_id: userId,
      title: conv.title,
      messages: conv.messages,
      pinned: conv.pinned || false,
      category: conv.category || 'Unassigned',
      created_at: conv.createdAt,
      updated_at: conv.updatedAt || Date.now()
    });
    if (error) console.warn("Supabase Sync Notice (Conversations):", error.message);
  } catch (err) {
    console.warn("Supabase sync offline mode active.");
  }
}

export async function fetchUserConversationsFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn("Supabase fetch notice:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}

export async function syncTaskToSupabase(userId: string, task: any) {
  try {
    const { error } = await supabase.from('tasks').upsert({
      id: task.id,
      user_id: userId,
      title: task.title,
      completed: task.completed,
      created_at: task.createdAt,
      due_date: task.dueDate || null,
      priority: task.priority || 'medium'
    });
    if (error) console.warn("Supabase Sync Notice (Tasks):", error.message);
  } catch (err) {
    console.warn("Supabase task sync offline.");
  }
}

export async function deleteTaskFromSupabase(taskId: string) {
  try {
    await supabase.from('tasks').delete().eq('id', taskId);
  } catch (err) {
    // Ignore offline errors
  }
}
