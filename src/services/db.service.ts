import { supabase } from '../lib/supabase';
import type { AppSession } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SavedProject {
  id: string;
  title: string;
  description: string;
  full_script: string | null;
  current_step: string;
  created_at: string;
  updated_at: string;
  session_data: Partial<AppSession>;
}

// ─── Strip un-serializable blobs from session ──────────────────────────────────
// Video blob URLs and base64 images are not saved — they don't persist anyway.

function stripBlobs(session: AppSession): Partial<AppSession> {
  const stripped: Partial<AppSession> = { ...session };

  if (stripped.scriptSplit) {
    stripped.scriptSplit = {
      ...stripped.scriptSplit,
      veo_core_clip: {
        ...stripped.scriptSplit.veo_core_clip,
        videoUrl: undefined,
        status: 'idle',
      },
      slide_scenes: stripped.scriptSplit.slide_scenes.map(sc => ({
        ...sc,
        imageUrl: undefined,
        imageStatus: 'idle',
      })),
    };
  }

  return stripped;
}

// ─── Project CRUD ──────────────────────────────────────────────────────────────

export async function saveProject(
  existingId: string | null,
  session: AppSession,
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const title       = session.planning?.topic ?? '제목 없음';
  const description = session.selectedIdea?.one_line_synopsis ?? '';
  const full_script = session.scriptSplit?.full_script ?? null;
  const current_step = session.currentStep;
  const session_data = stripBlobs(session);

  if (existingId) {
    const { error } = await supabase
      .from('projects')
      .update({ title, description, full_script, current_step, session_data, updated_at: new Date().toISOString() })
      .eq('id', existingId)
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return existingId;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, title, description, full_script, current_step, session_data })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function listProjects(): Promise<SavedProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, full_script, current_step, created_at, updated_at, session_data')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SavedProject[];
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── User Profile (API keys) ───────────────────────────────────────────────────

export async function loadUserProfile(userId: string) {
  const { data } = await supabase
    .from('user_profiles')
    .select('gemini_api_key')
    .eq('id', userId)
    .single();
  return data;
}

export async function saveUserProfile(userId: string, geminiApiKey: string) {
  await supabase.from('user_profiles').upsert({
    id: userId,
    gemini_api_key: geminiApiKey,
    updated_at: new Date().toISOString(),
  });
}
