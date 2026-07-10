import { GoogleGenerativeAI } from '@google/generative-ai';
import type { PlanningInput, ContentIdea, HookOption, ScriptSplit, UploadCopyPackage, ReferenceStyle } from '../types';
import {
  buildIdeaPrompt, buildHookPrompt, buildScriptSplitPrompt,
  buildImageAnalysisPrompt, buildUploadCopyPrompt,
} from '../prompts';

const MODEL_ID = 'gemini-2.0-flash-exp';

function getModel(apiKey: string) {
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL_ID });
}

async function generateJSON<T>(apiKey: string, prompt: string): Promise<T> {
  const result = await getModel(apiKey).generateContent(prompt);
  const text = result.response.text();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('응답에서 JSON을 찾을 수 없습니다.');
  return JSON.parse(match[0]) as T;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function generateIdeas(apiKey: string, p: PlanningInput): Promise<ContentIdea[]> {
  const data = await generateJSON<{ ideas: ContentIdea[] }>(apiKey, buildIdeaPrompt(p));
  return data.ideas;
}

export async function generateHooks(
  apiKey: string, p: PlanningInput, idea: ContentIdea, style?: ReferenceStyle | null,
): Promise<HookOption[]> {
  const data = await generateJSON<{ hooks: HookOption[] }>(apiKey, buildHookPrompt(p, idea, style));
  return data.hooks;
}

export async function generateScriptSplit(
  apiKey: string, p: PlanningInput, idea: ContentIdea, hook: HookOption,
  style?: ReferenceStyle | null,
): Promise<ScriptSplit> {
  const raw = await generateJSON<any>(apiKey, buildScriptSplitPrompt(p, idea, hook, style));
  return {
    full_script: raw.full_script ?? '',
    structure: raw.structure ?? { problem: '', empathy: '', solution: '', action: '' },
    veo_core_clip: {
      text: raw.veo_core_clip?.text ?? '',
      prompt: raw.veo_core_clip?.prompt ?? '',
      duration: raw.veo_core_clip?.duration ?? 8,
      status: 'idle',
    },
    slide_scenes: (raw.slide_scenes ?? []).map((s: any) => ({
      scene_id: s.scene_id ?? `slide_${Math.random().toString(36).slice(2)}`,
      scene_title: s.scene_title ?? '',
      on_screen_text: s.on_screen_text ?? '',
      narration_text: s.narration_text ?? '',
      visual_description: s.visual_description ?? '',
      duration_seconds: s.duration_seconds ?? 3,
      imageStatus: 'idle' as const,
    })),
  };
}

export async function analyzeImage(apiKey: string, file: File): Promise<string> {
  const model = getModel(apiKey);
  const bytes = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const result = await model.generateContent([
    buildImageAnalysisPrompt(),
    { inlineData: { data: base64, mimeType: file.type } },
  ]);
  return result.response.text();
}

export async function generateUploadCopy(
  apiKey: string, p: PlanningInput, idea: ContentIdea, hook: HookOption,
): Promise<UploadCopyPackage> {
  return generateJSON<UploadCopyPackage>(apiKey, buildUploadCopyPrompt(p, idea, hook));
}

export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    await getModel(apiKey).generateContent('테스트. 한 단어로만 응답하세요: 확인');
    return true;
  } catch {
    return false;
  }
}
