// ─── Slide Image Generation via Gemini / Imagen API ──────────────────────────
// Uses gemini-2.0-flash-preview-image-generation for inline image generation.
// Falls back to imagen-3.0-generate-001 if primary model unavailable.
//
// INTEGRATION POINT: Update model names as Google releases newer versions.

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation';
const IMAGEN_MODEL = 'imagen-3.0-generate-001';

export interface ImageGenResult {
  imageUrl: string;   // data URI: "data:image/png;base64,..."
  mimeType: string;
}

async function generateViaGeminiFlash(apiKey: string, prompt: string): Promise<ImageGenResult> {
  const res = await fetch(
    `${BASE}/models/${GEMINI_IMAGE_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['image'],
          imageGenerationConfig: {
            aspectRatio: '9:16',
            numberOfImages: 1,
          },
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `이미지 생성 오류: HTTP ${res.status}`);
  }

  const data = await res.json();
  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p: any) => p?.inlineData?.mimeType?.startsWith('image/'));
  if (!img?.inlineData) throw new Error('이미지 데이터를 응답에서 찾을 수 없습니다.');

  return {
    imageUrl: `data:${img.inlineData.mimeType};base64,${img.inlineData.data}`,
    mimeType: img.inlineData.mimeType,
  };
}

async function generateViaImagen(apiKey: string, prompt: string): Promise<ImageGenResult> {
  const res = await fetch(
    `${BASE}/models/${IMAGEN_MODEL}:generateImages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        prompt,
        generationConfig: {
          numberOfImages: 1,
          aspectRatio: '9:16',
          outputMimeType: 'image/jpeg',
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Imagen API 오류: HTTP ${res.status}`);
  }

  const data = await res.json();
  const img = data?.predictions?.[0];
  if (!img?.bytesBase64Encoded) throw new Error('이미지 데이터를 응답에서 찾을 수 없습니다.');

  return {
    imageUrl: `data:image/jpeg;base64,${img.bytesBase64Encoded}`,
    mimeType: 'image/jpeg',
  };
}

// Public function — tries Gemini Flash first, then Imagen
export async function generateSlideImage(apiKey: string, prompt: string): Promise<ImageGenResult> {
  try {
    return await generateViaGeminiFlash(apiKey, prompt);
  } catch (e) {
    // Gemini Flash image generation may not be available in all regions/plans;
    // fall through to Imagen
    try {
      return await generateViaImagen(apiKey, prompt);
    } catch {
      throw e; // surface original error if both fail
    }
  }
}
