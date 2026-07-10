import type { PlanningInput, ContentIdea, HookOption, ScriptSplit, ReferenceStyle } from '../types';

// ─── Context Builder ───────────────────────────────────────────────────────────

function ctx(p: PlanningInput) {
  return `
[기획 컨텍스트]
- 작성자 소개: ${p.identity}
- 카테고리: ${p.category}
- 주제: ${p.topic}
- 주요 포인트 1: ${p.mainPoints[0]}
- 주요 포인트 2: ${p.mainPoints[1]}
- 주요 포인트 3: ${p.mainPoints[2]}
- 피해야 할 표현: ${p.bannedExpressions || '없음'}
- 원하는 말투: ${p.tone}
`.trim();
}

// ─── Style Guide Builder (레퍼런스 분석 결과 또는 트렌드 기본값) ────────────────

function styleCtx(style?: ReferenceStyle | null): string {
  if (!style) return '';
  return `
[스타일 가이드 — 레퍼런스 영상 분석 결과]
- 컨셉/무드: ${style.concept}
- 색감: ${style.colorPalette.join(', ')}
- 자막: ${style.subtitle.description} (위치: ${style.subtitle.position}, 크기: ${style.subtitle.size})
- BGM: ${style.bgm}
- 효과음: ${style.soundEffects.join(', ')}
- 편집 템포: ${style.editingPace}
→ 모든 산출물(대본 톤, 씬 구성, 화면 텍스트, 이미지/영상 프롬프트)을 이 스타일과 최대한 비슷한 분위기로 맞출 것.
`.trim();
}

// ─── Idea Generation ───────────────────────────────────────────────────────────

export function buildIdeaPrompt(p: PlanningInput): string {
  return `
당신은 한국 정치 숏폼 콘텐츠 전략 전문가입니다.
아래 기획 정보를 바탕으로 30초 숏폼 영상 콘텐츠 아이디어 3가지를 생성해주세요.

${ctx(p)}

규칙:
- 카테고리와 말투를 철저히 반영할 것
- 피해야 할 표현 절대 사용 금지
- 확인되지 않은 사실 단정 금지
- 혐오, 폭력, 명예훼손, 과격한 표현 금지
- 따뜻하고 진중하게, 위로와 응원 중심

반드시 아래 JSON 형식으로만 응답 (다른 텍스트 없이):
{
  "ideas": [
    {
      "id": "idea_1",
      "idea_title": "짧은 한글 제목",
      "main_angle": "콘텐츠의 핵심 방향",
      "target_audience": "주요 시청자층",
      "emotional_angle": "감성적 방향",
      "why_it_resonates": "왜 공감을 받는지 짧게",
      "one_line_synopsis": "한 줄 요약"
    },
    { "id": "idea_2", ... },
    { "id": "idea_3", ... }
  ]
}
`.trim();
}

// ─── Hook Generation ───────────────────────────────────────────────────────────

export function buildHookPrompt(p: PlanningInput, idea: ContentIdea, style?: ReferenceStyle | null): string {
  return `
당신은 숏폼 영상 오프닝 카피라이터입니다.
첫 3초를 사로잡을 훅 라인 3가지를 만들어주세요.

${ctx(p)}
${styleCtx(style)}
선택된 아이디어: ${idea.idea_title}
핵심 방향: ${idea.main_angle}
감성 방향: ${idea.emotional_angle}

규칙:
- 15자 이내로 짧고 강렬하게
- 따뜻하고 직접적인 문장
- 공격적 표현, 과격한 비난 금지
- 각 훅은 서로 다른 스타일 (질문형/선언형/공감형)

반드시 아래 JSON 형식으로만 응답:
{
  "hooks": [
    { "id": "hook_1", "text": "훅 텍스트", "style": "질문형" },
    { "id": "hook_2", "text": "훅 텍스트", "style": "선언형" },
    { "id": "hook_3", "text": "훅 텍스트", "style": "공감형" }
  ]
}
`.trim();
}

// ─── Script + Split Generation ────────────────────────────────────────────────

export function buildScriptSplitPrompt(
  p: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
  style?: ReferenceStyle | null,
): string {
  return `
당신은 숏폼 대본 작가입니다.
20초 숏폼 영상 대본을 작성하고, Veo AI 클립(0-8초)과 슬라이드(8-20초)로 분리해주세요.

${ctx(p)}
${styleCtx(style)}
선택된 아이디어: ${idea.idea_title}
선택된 훅: "${hook.text}" (${hook.style})

[전체 대본 구조]
- 문제 (Problem): 공감받는 현재 상황
- 공감 (Empathy): 함께 아파하는 메시지
- 해결 (Solution): 새로운 관점 또는 방향
- 행동 (Action/CTA): 함께 하자는 제안

[분리 규칙]
1) veo_core_clip (정확히 8초 분량):
   - 선택된 훅으로 시작
   - 문제 + 공감의 핵심 요약
   - 낭독 시 8초 안에 끝나는 길이
   - Veo AI 영상 생성 프롬프트 (영어로 작성):
     * 세로 9:16 비율
     * 위 스타일 가이드의 컨셉·색감·무드를 반드시 반영
     * 특정 브랜드 로고나 심벌 없이

2) slide_scenes (남은 12초, 반드시 4개 장면):
   - 각 장면은 3초 (4개 × 3초 = 총 12초)
   - on_screen_text: 화면에 크게 표시할 1-2줄
   - narration_text: 추가 나레이션
   - visual_description: 이미지 생성용 설명 (영어) — 스타일 가이드의 색감·무드 반영

규칙:
- 피해야 할 표현 절대 금지
- 말투: ${p.tone}
- 확인되지 않은 사실 단정 금지

반드시 아래 JSON 형식으로만 응답:
{
  "full_script": "전체 대본 텍스트",
  "structure": {
    "problem": "문제 파트",
    "empathy": "공감 파트",
    "solution": "해결 파트",
    "action": "행동 파트"
  },
  "veo_core_clip": {
    "text": "훅+문제+공감 핵심 요약 (8초 분량)",
    "prompt": "English Veo prompt: vertical 9:16, matching the style guide mood and colors...",
    "duration": 8
  },
  "slide_scenes": [
    {
      "scene_id": "slide_1",
      "scene_title": "장면 제목",
      "on_screen_text": "화면에 크게 표시될 1-2줄",
      "narration_text": "나레이션 텍스트",
      "visual_description": "English image prompt for AI generation, matching the style guide",
      "duration_seconds": 3
    }
  ]
}
`.trim();
}

// ─── Veo Prompt Builder ───────────────────────────────────────────────────────

export function buildVeoPrompt(
  p: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
  clipText: string,
  duration: number,
  style?: ReferenceStyle | null,
): string {
  const styleBlock = style ? `
Reference style guide (match this as closely as possible):
${style.promptGuide}
Color palette: ${style.colorPalette.join(', ')}
Editing pace: ${style.editingPace}
BGM mood: ${style.bgm}
` : `
Visual style:
- Warm natural lighting, soft focus background
- Authentic, non-staged feeling
- Clean modern Korean urban environment
`;

  return `
Vertical short-form video clip, ${duration} seconds, 9:16 aspect ratio.

Content theme: ${idea.main_angle}
Opening hook: "${hook.text}"
Narration: "${clipText}"
${styleBlock}
Rules:
- Korean setting, authentic and human
- NO brand logos, NO political symbols visible
- Space for voice-over narration and caption overlay

Camera:
- Close-up to medium shot
- Eye contact with camera (direct address to viewer)
`.trim();
}

// ─── Slide Image Prompt ───────────────────────────────────────────────────────

export function buildSlideImagePrompt(
  scene: { scene_title: string; visual_description: string },
  _idea: ContentIdea,
  style?: ReferenceStyle | null,
): string {
  const styleBlock = style ? `
Reference style guide (match this as closely as possible):
${style.promptGuide}
Color palette: ${style.colorPalette.join(', ')}
` : `
- Warm, documentary-style photography
- Soft, warm color palette (amber, warm white, gentle blues)
`;

  return `
Vertical 9:16 image for a short-form video slide.

Scene theme: ${scene.scene_title}
Visual description: ${scene.visual_description}

Style requirements:
- Vertical composition (9:16 portrait orientation)
- Korean setting, authentic and human
${styleBlock}
- Leave space in upper or lower third for text overlay
- No brand logos, no political symbols
- High quality, clean composition
`.trim();
}

// ─── Upload Copy ──────────────────────────────────────────────────────────────

export function buildUploadCopyPrompt(
  p: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
): string {
  return `
당신은 SNS 콘텐츠 카피라이터입니다.
아래 정보를 바탕으로 각 플랫폼용 업로드 카피를 생성해주세요.

${ctx(p)}
아이디어: ${idea.idea_title}
훅: "${hook.text}"
핵심 방향: ${idea.main_angle}

생성 내용:
1. 제목 3가지 (직접적/질문형/감성형)
2. 해시태그 세트
3. 플랫폼별 카피 (YouTube Shorts, Instagram Reels, TikTok, KakaoTalk, Threads)
   - 각 플랫폼에 맞는 길이, 말투, 해시태그 밀도, CTA 조정
   - Threads: 줄바꿈 활용, 짧은 문장, 해시태그 2-4개, 대화체

규칙:
- 따뜻하고 감사하는 톤
- 공격적 표현 금지
- 사실 확인이 안 된 주장 금지

반드시 아래 JSON 형식으로만 응답:
{
  "titles": [
    { "id": "t1", "text": "제목 1", "style": "직접적" },
    { "id": "t2", "text": "제목 2", "style": "질문형" },
    { "id": "t3", "text": "제목 3", "style": "감성형" }
  ],
  "hashtags": ["#크리에이터", "#숏폼", "#유튜브쇼츠"],
  "platformVersions": [
    {
      "platform": "youtube",
      "platformLabel": "YouTube Shorts",
      "title": "유튜브용 제목",
      "caption": "유튜브용 설명",
      "hashtags": ["#shorts", "#크리에이터"],
      "cta": "구독과 좋아요 부탁드립니다"
    },
    { "platform": "instagram", "platformLabel": "Instagram Reels", ... },
    { "platform": "tiktok", "platformLabel": "TikTok", ... },
    { "platform": "kakao", "platformLabel": "카카오 공유", ... },
    { "platform": "threads", "platformLabel": "Threads", ... }
  ]
}
`.trim();
}

// ─── Image Analysis ────────────────────────────────────────────────────────────

export function buildImageAnalysisPrompt(): string {
  return `이 이미지를 분석해주세요. 정치 숏폼 콘텐츠 제작에 활용할 수 있도록:
1. 이미지에 보이는 주요 내용
2. 전달되는 분위기 또는 감성
3. 어떤 씬에 활용하면 좋을지

3-4문장으로 간결하게 답해주세요.`;
}
