import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials (Fallback to environment variables if set)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dabzjdeswxdhfcczprup.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3T2sWbwkD_jZDI8CQ9QgCw_u0edN5a-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * SQL Schema + Security policies to run in the Supabase SQL Editor:
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
 *
 * CREATE TABLE IF NOT EXISTS profiles (
 *   id TEXT PRIMARY KEY,        -- Supabase Auth user UUID (auth.uid()::text)
 *   email TEXT NOT NULL,
 *   role TEXT DEFAULT 'user',   -- 'user' | 'admin'
 *   plan TEXT DEFAULT 'free',
 *   created_at BIGINT NOT NULL
 * );
 *
 * SECURITY: tables must be protected by Row Level Security, otherwise the
 * publishable key in this bundle lets anyone read/delete every row and set
 * their own role to 'admin'. Run `supabase/security_policies.sql` in the
 * SQL Editor (it enables RLS and creates all policies).
 */

// Returns the currently authenticated Supabase user (with a real auth session),
// or null when the visitor is browsing as a guest.
export async function getSupabaseUser(): Promise<{ id: string; email: string } | null> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return null;
    return { id: data.user.id, email: data.user.email || '' };
  } catch {
    return null;
  }
}

// Returns the current session access token, used to authenticate requests to
// serverless endpoints like /api/chat. Returns null when signed out.
export async function getSessionAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

export interface SupabaseConversationPayload {
  id: string;
  title: string;
  messages: unknown[];
  pinned?: boolean;
  category?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface SupabaseTaskPayload {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  dueDate?: number;
  priority?: string;
}

// Ownership guard: cloud writes/reads only happen for the authenticated owner.
// Under RLS a mismatched user_id would be rejected anyway; this prevents the
// guest workspace from ever touching Supabase at all.
async function isAuthenticatedOwner(userId: string): Promise<boolean> {
  const user = await getSupabaseUser();
  return !!user && user.id === userId;
}

export async function syncConversationToSupabase(userId: string, conv: SupabaseConversationPayload) {
  try {
    if (!(await isAuthenticatedOwner(userId))) return;
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
  } catch {
    console.warn("Supabase sync offline mode active.");
  }
}

export async function fetchUserConversationsFromSupabase(userId: string) {
  try {
    if (!(await isAuthenticatedOwner(userId))) return null;
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
  } catch {
    return null;
  }
}

export async function syncTaskToSupabase(userId: string, task: SupabaseTaskPayload) {
  try {
    if (!(await isAuthenticatedOwner(userId))) return;
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
  } catch {
    console.warn("Supabase task sync offline.");
  }
}

export async function deleteTaskFromSupabase(taskId: string) {
  try {
    // RLS only lets the row owner delete; guests have no session so this no-ops.
    const user = await getSupabaseUser();
    if (!user) return;
    await supabase.from('tasks').delete().eq('id', taskId);
  } catch {
    // Ignore offline errors
  }
}

export async function supabaseSignIn(email: string, pass: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) throw error;
    return { user: { id: data.user.id, email: data.user.email || '' }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { user: null, error: message || 'Authentication failed' };
  }
}

// Sends a password-reset email. The recovery link points back to the site,
// where the ResetPassword page lets the user choose a new password.
export async function supabaseResetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message || 'Failed to send password reset email' };
  }
}

// Completes a password reset using the recovery session that Supabase
// attached to the reset link. Only callable while on the recovery page.
export async function supabaseUpdatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message || 'Failed to update password' };
  }
}

export async function supabaseSignUp(email: string, pass: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass
    });

    if (error) throw error;

    // No session means "confirm email" is enabled in Supabase Auth settings —
    // the account only becomes real after the user clicks the confirmation link.
    if (!data.session || !data.user) {
      return {
        user: null,
        error: 'Account created! Please check your email for a confirmation link, then sign in.'
      };
    }

    return { user: { id: data.user.id, email: data.user.email || '' }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number })?.status;
    if (status === 429 || message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('invalid')) {
      return {
        user: null,
        error: 'Sign-ups are temporarily rate-limited by Supabase (free tier allows ~2/hour while "Confirm email" is enabled). Wait about an hour, or turn off "Confirm email" in Supabase → Authentication → Sign In / Providers → Email to remove the limit.'
      };
    }
    return { user: null, error: message || 'Sign up failed' };
  }
}

// Upsert the authenticated user's profile row (keyed by the real auth UUID).
// Role/plan are never set from the client: new rows default to user/free, and
// RLS + a database trigger prevent any client-side role escalation.
export async function syncProfileToSupabase(user: { id: string; email: string }) {
  try {
    if (!user?.id) return;
    const { data: existing } = await supabase
      .from('profiles')
      .select('role, plan, created_at')
      .eq('id', user.id)
      .maybeSingle();

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      role: existing?.role || 'user',
      plan: existing?.plan || (existing?.role === 'admin' ? 'pro' : 'free'),
      created_at: existing?.created_at || Date.now()
    });
  } catch {
    // Ignore profile sync errors
  }
}

// Read the role stored for an account in the profiles table.
// Returns 'user' as the default when no explicit role has been assigned.
export async function getProfileRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return data.role || 'user';
  } catch {
    return null;
  }
}
