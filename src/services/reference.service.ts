// ─── Reference Video Style Analysis Service ───────────────────────────────────
// 사용자가 올린 레퍼런스 영상(링크 또는 파일)을 Gemini 멀티모달로 분석해
// 컨셉·색감·자막·BGM·효과음·편집 템포를 추출한다.
// 레퍼런스가 없으면 최신 숏폼 트렌드 기본 스타일(TREND_DEFAULT_STYLE)을 사용한다.

import type { ReferenceStyle } from '../types';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
// gemini-2.0-flash-exp는 2026-06-01 서비스 종료 → 2.5 Flash로 마이그레이션
const MODEL = 'gemini-2.5-flash';

// 업로드 영상 인라인 전송 한도 (Gemini inline 요청 20MB 제한 고려)
export const MAX_REFERENCE_VIDEO_BYTES = 15 * 1024 * 1024;

// ─── 트렌드 기본 스타일 (레퍼런스 미제공 시) ─────────────────────────────────

export const TREND_DEFAULT_STYLE: ReferenceStyle = {
  concept: '최신 숏폼 트렌드 — 첫 1초 강한 훅, 빠른 컷 전환, 자막 중심 스토리텔링',
  colorPalette: ['고대비 비비드', '#FFFFFF', '#FFD60A'],
  subtitle: {
    position: 'center',
    size: 'large',
    style: 'bold',
    description: '굵은 고딕체, 화면 중앙 배치, 핵심 키워드만 노란색 강조',
  },
  bgm: '업비트 트렌디 팝/일렉트로닉 — 훅 진입 순간 비트 드롭',
  soundEffects: ['컷 전환 스우시', '키워드 등장 팝', '숫자 카운트 효과음'],
  editingPace: '컷당 1.5~2.5초의 빠른 템포, 지루한 구간 없이 밀도 있게',
  promptGuide:
    'Trending short-form style: punchy 1-second hook, fast cuts every ~2 seconds, '
    + 'bold centered captions with yellow keyword highlights, high-contrast vivid color grading, '
    + 'upbeat electronic BGM with a beat drop at the hook, swoosh transition sounds, '
    + 'vertical 9:16, energy kept high from first frame to CTA.',
};

// ─── 분석 프롬프트 ────────────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `
이 숏폼 영상을 스타일 관점에서 분석해주세요. 우리는 이 영상과 최대한 비슷한
분위기의 숏폼을 제작하려고 합니다.

분석 항목:
1. 전체 컨셉/무드 (한 문장, 한글)
2. 주요 색상 팔레트 (hex 코드 또는 짧은 설명 2~4개)
3. 자막 스타일 — 위치(top/center/bottom), 크기(large/medium/small), 스타일(bold/outline/shadow/default), 폰트 느낌과 강조 방식
4. 배경 음악 분위기 (한 문장)
5. 효과음 특징 (2~4개)
6. 편집 템포 (컷 길이, 전환 방식)
7. 위 내용을 종합한 영문 스타일 가이드 (영상/이미지 생성 AI 프롬프트에 붙일 수 있게 구체적으로)

반드시 아래 JSON 형식으로만 응답 (다른 텍스트 없이):
{
  "concept": "컨셉 요약",
  "colorPalette": ["#000000", "#FFFFFF"],
  "subtitle": {
    "position": "bottom",
    "size": "large",
    "style": "bold",
    "description": "자막 스타일 설명"
  },
  "bgm": "배경음악 분위기",
  "soundEffects": ["효과음1", "효과음2"],
  "editingPace": "편집 템포 설명",
  "promptGuide": "English style guide for AI generation prompts..."
}
`.trim();

// ─── 응답 검증/보정 ───────────────────────────────────────────────────────────

const POSITIONS = ['top', 'center', 'bottom'] as const;
const SIZES = ['large', 'medium', 'small'] as const;
const SUB_STYLES = ['default', 'bold', 'outline', 'shadow'] as const;

function sanitize(raw: any): ReferenceStyle {
  const d = TREND_DEFAULT_STYLE;
  const sub = raw?.subtitle ?? {};
  return {
    concept: typeof raw?.concept === 'string' && raw.concept ? raw.concept : d.concept,
    colorPalette: Array.isArray(raw?.colorPalette) && raw.colorPalette.length
      ? raw.colorPalette.map(String) : d.colorPalette,
    subtitle: {
      position: POSITIONS.includes(sub.position) ? sub.position : d.subtitle.position,
      size: SIZES.includes(sub.size) ? sub.size : d.subtitle.size,
      style: SUB_STYLES.includes(sub.style) ? sub.style : d.subtitle.style,
      description: typeof sub.description === 'string' && sub.description
        ? sub.description : d.subtitle.description,
    },
    bgm: typeof raw?.bgm === 'string' && raw.bgm ? raw.bgm : d.bgm,
    soundEffects: Array.isArray(raw?.soundEffects) && raw.soundEffects.length
      ? raw.soundEffects.map(String) : d.soundEffects,
    editingPace: typeof raw?.editingPace === 'string' && raw.editingPace
      ? raw.editingPace : d.editingPace,
    promptGuide: typeof raw?.promptGuide === 'string' && raw.promptGuide
      ? raw.promptGuide : d.promptGuide,
  };
}

// ─── 분석 API ─────────────────────────────────────────────────────────────────

export interface ReferenceSource {
  url?: string;             // YouTube 등 공개 링크
  videoDataUrl?: string;    // data:video/mp4;base64,... (업로드 파일)
  videoMimeType?: string;
}

export async function analyzeReference(
  apiKey: string,
  source: ReferenceSource,
): Promise<ReferenceStyle> {
  const parts: any[] = [];

  if (source.videoDataUrl) {
    const base64 = source.videoDataUrl.split(',')[1];
    if (!base64) throw new Error('영상 데이터를 읽을 수 없습니다.');
    parts.push({
      inlineData: {
        mimeType: source.videoMimeType ?? 'video/mp4',
        data: base64,
      },
    });
  } else if (source.url) {
    // Gemini는 공개 YouTube URL을 fileData로 직접 분석할 수 있음
    parts.push({ fileData: { fileUri: source.url } });
  } else {
    throw new Error('분석할 레퍼런스가 없습니다.');
  }

  parts.push({ text: ANALYSIS_PROMPT });

  const res = await fetch(`${BASE}/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `레퍼런스 분석 실패: HTTP ${res.status}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text ?? '').join('') ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('레퍼런스 분석 응답에서 JSON을 찾을 수 없습니다.');
  return sanitize(JSON.parse(match[0]));
}

export async function mockAnalyzeReference(): Promise<ReferenceStyle> {
  await new Promise<void>(r => setTimeout(r, 1500));
  return {
    ...TREND_DEFAULT_STYLE,
    concept: '(데모) 레퍼런스 분석 — 밝고 경쾌한 브이로그 스타일, 빠른 컷과 큰 자막',
  };
}
