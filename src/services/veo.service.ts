// ─── Veo 3.1 Lite Video Generation Service ────────────────────────────────────
// Direct REST API integration with the Gemini / Google AI video generation API.
// Model: veo-3.1-lite-generate-preview (or veo-3-0-generate-preview as fallback)
//
// INTEGRATION POINT: The exact model name and response schema may need
// adjustment as the Veo API evolves. Check the Google AI documentation at
// https://ai.google.dev/api/generate-content for the latest model IDs.

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Try 3.1 Lite first; model name will 404 if not yet available — caller should catch
export const VEO_MODEL = 'veo-3.1-lite-generate-preview';
export const VEO_MODEL_FALLBACK = 'veo-3-0-generate-preview';

export interface VeoOptions {
  prompt: string;
  durationSeconds: number;   // 8–10
  aspectRatio?: '9:16' | '16:9' | '1:1';
  fps?: number;
}

export interface VeoResult {
  videoUrl: string;           // base64 data URI  e.g. "data:video/mp4;base64,..."
  mimeType: string;
  durationSeconds: number;
}

type ProgressCallback = (msg: string) => void;

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Poll a long-running operation until done or timeout
async function pollOperation(
  apiKey: string,
  operationName: string,
  onProgress: ProgressCallback,
  maxMs = 300_000,
): Promise<any> {
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < maxMs) {
    await sleep(Math.min(5000 + attempt * 1000, 10_000));
    attempt++;
    onProgress(`영상 생성 중... (${Math.round((Date.now() - start) / 1000)}초 경과)`);
    const res = await fetch(`${BASE}/${operationName}`, {
      headers: { 'x-goog-api-key': apiKey },
    });
    if (!res.ok) continue;
    const op = await res.json();
    if (op.done) {
      if (op.error) throw new Error(op.error.message ?? 'Veo API 오류');
      return op.response;
    }
  }
  throw new Error('영상 생성 시간 초과 (5분). 나중에 다시 시도해주세요.');
}

// Extract video data from various response shapes Veo API may return
function extractVideoData(data: any): { base64: string; mimeType: string } | null {
  // Shape 1: candidates[].content.parts[].inlineData
  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    if (p?.inlineData?.mimeType?.startsWith('video/')) {
      return { base64: p.inlineData.data, mimeType: p.inlineData.mimeType };
    }
  }
  // Shape 2: predictions[].video.encodedVideo
  const preds: any[] = data?.predictions ?? [];
  for (const pred of preds) {
    if (pred?.video?.encodedVideo) {
      return { base64: pred.video.encodedVideo, mimeType: 'video/mp4' };
    }
  }
  return null;
}

export async function generateVeoClip(
  apiKey: string,
  options: VeoOptions,
  onProgress: ProgressCallback = () => {},
): Promise<VeoResult> {
  const { prompt, durationSeconds, aspectRatio = '9:16', fps = 24 } = options;

  onProgress('Veo 영상 생성 요청 중...');

  // ── INTEGRATION POINT ──────────────────────────────────────────────────────
  // The generationConfig / videoConfig field names below reflect the most
  // likely Gemini API schema as of 2025. Adjust if the API changes.
  // ─────────────────────────────────────────────────────────────────────────

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['video'],
      videoGenerationConfig: {
        durationSeconds,
        aspectRatio,
        fps,
        resolution: '720p',
      },
    },
  };

  let res = await fetch(`${BASE}/models/${VEO_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  });

  // Fallback to stable model if Lite not yet available
  if (res.status === 404) {
    onProgress('Veo 3.1 Lite 미지원 — 안정 모델로 재시도...');
    res = await fetch(`${BASE}/models/${VEO_MODEL_FALLBACK}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Veo API 오류: HTTP ${res.status}`);
  }

  const data = await res.json();

  // Long-running operation response
  if (data.name && !data.candidates) {
    onProgress('영상 생성 큐에 등록됨 — 폴링 중...');
    const response = await pollOperation(apiKey, data.name, onProgress);
    const video = extractVideoData(response);
    if (!video) throw new Error('영상 데이터를 응답에서 찾을 수 없습니다.');
    return {
      videoUrl: `data:${video.mimeType};base64,${video.base64}`,
      mimeType: video.mimeType,
      durationSeconds,
    };
  }

  // Synchronous response (short clips)
  const video = extractVideoData(data);
  if (!video) throw new Error('영상 데이터를 응답에서 찾을 수 없습니다.');
  return {
    videoUrl: `data:${video.mimeType};base64,${video.base64}`,
    mimeType: video.mimeType,
    durationSeconds,
  };
}

// ── FUTURE CONNECTOR (disabled) ───────────────────────────────────────────────
// Google Flow exporter lives here when ready.
// To enable: implement exportToFlow(apiKey, veoResult, slideScenes) → flowProjectUrl
// Keep this function stub so callers can wire it in without touching other modules.
export async function exportToFlow(
  _apiKey: string,
  _veoResult: VeoResult,
  _slideScenes: unknown[],
): Promise<never> {
  throw new Error('Google Flow 내보내기는 아직 지원되지 않습니다.');
}
