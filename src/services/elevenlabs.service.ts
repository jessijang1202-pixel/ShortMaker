import type { SoundEffect } from '../types';

// ─── Sound Generation API ─────────────────────────────────────────────────────

export async function generateSoundEffect(
  apiKey: string,
  prompt: string,
  durationSeconds: number = 2,
): Promise<string> {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: Math.min(Math.max(durationSeconds, 0.5), 22),
      prompt_influence: 0.3,
    }),
  });

  if (!res.ok) {
    let msg = `오류 ${res.status}`;
    try { const json = await res.json(); msg = json?.detail?.message ?? msg; } catch { /* ignore */ }
    throw new Error(`ElevenLabs: ${msg}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ─── Auto-suggest sound effects from planning context ─────────────────────────

export function suggestSoundEffects(topic: string, category: string): SoundEffect[] {
  const hint =
    category === '뉴스'   ? 'breaking news broadcast'
    : category === '정책' ? 'policy announcement political'
    : category === '당이슈' ? 'political rally campaign'
    : 'important political speech';

  const short = topic.slice(0, 40) || '정치 이슈';
  const now = Date.now();

  return [
    {
      id: `sfx_${now}_1`,
      label: '도입부 임팩트',
      prompt: `dramatic orchestral impact hit for ${hint} about "${short}", powerful news opening`,
      durationSeconds: 2,
      status: 'idle',
    },
    {
      id: `sfx_${now}_2`,
      label: '장면 전환',
      prompt: 'smooth cinematic whoosh swoosh transition sound effect, subtle and brief',
      durationSeconds: 1,
      status: 'idle',
    },
    {
      id: `sfx_${now}_3`,
      label: '강조 효과음',
      prompt: 'news broadcast notification chime, brief alert emphasis sound, sharp click',
      durationSeconds: 1,
      status: 'idle',
    },
    {
      id: `sfx_${now}_4`,
      label: '마무리 효과음',
      prompt: `hopeful inspiring rising orchestral sound for ${hint}, positive political ending`,
      durationSeconds: 3,
      status: 'idle',
    },
  ];
}
