import type { CaptionBurst } from '../types';

// AI가 caption 배열을 안 주거나 형식이 이상할 때 쓰는 폴백:
// 나레이션 텍스트를 2~4단어씩 짧게 잘라 클립 길이에 고르게 분배한다.
export function splitIntoCaptionBursts(text: string, duration: number): CaptionBurst[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || duration <= 0) return [];

  const targetBursts = Math.min(6, Math.max(3, Math.round(duration / 1.5)));
  const wordsPerBurst = Math.max(2, Math.ceil(words.length / targetBursts));

  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerBurst) {
    chunks.push(words.slice(i, i + wordsPerBurst).join(' '));
  }

  const per = duration / chunks.length;
  return chunks.map((chunkText, i) => ({
    text: chunkText,
    start: +(i * per).toFixed(2),
    end: +((i + 1) * per).toFixed(2),
  }));
}

export function sanitizeCaptionBursts(raw: unknown, fallbackText: string, duration: number): CaptionBurst[] {
  if (Array.isArray(raw) && raw.length) {
    const cleaned = raw
      .map((c: any) => ({
        text: typeof c?.text === 'string' ? c.text.trim() : '',
        start: Number(c?.start) || 0,
        end: Number(c?.end) || 0,
      }))
      .filter(c => c.text && c.end > c.start);
    if (cleaned.length) return cleaned;
  }
  return splitIntoCaptionBursts(fallbackText, duration);
}
