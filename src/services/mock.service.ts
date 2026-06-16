// ─── Mock Service — Demo data for "새벽 기상 루틴" lifestyle vlog scenario ───────

import type {
  ContentIdea, HookOption, ScriptSplit, UploadCopyPackage, VeoCoreClip, SlideScene,
} from '../types';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Demo Seed Data ────────────────────────────────────────────────────────────

export const DEMO_IDEAS: ContentIdea[] = [
  {
    id: 'idea_1',
    idea_title: '새벽 5시, 나의 하루가 시작됩니다',
    main_angle: '새벽 기상 루틴을 솔직하게 공개하는 일상 밀착형',
    target_audience: '더 생산적인 하루를 원하는 20-30대 직장인',
    emotional_angle: '새벽의 고요함과 나만의 시간이 주는 성취감',
    why_it_resonates: '많은 사람이 시도하지만 포기하는 새벽 기상을 현실감 있게 보여줘 공감 유발',
    one_line_synopsis: '알람 5번 끄던 내가 새벽 기상 3년째 — 진짜 비결을 30초로 정리했습니다',
  },
  {
    id: 'idea_2',
    idea_title: '이 루틴 하나로 하루가 달라졌어요',
    main_angle: '단 하나의 아침 습관이 일상 전체를 바꾼 경험담',
    target_audience: '습관 형성에 관심 있는 직장인, 자기계발 유튜브 구독자',
    emotional_angle: '작은 변화가 만들어낸 큰 차이에 대한 놀라움과 뿌듯함',
    why_it_resonates: '거창하지 않은 현실적 루틴이라 따라 해보고 싶은 마음을 자극',
    one_line_synopsis: '아침 30분 루틴 하나 바꿨더니 야근이 줄었습니다 — 진짜입니다',
  },
  {
    id: 'idea_3',
    idea_title: '2주 동안 직접 해봤습니다',
    main_angle: '새벽 기상 챌린지 2주 체험기, 솔직한 전후 비교',
    target_audience: '챌린지·도전 콘텐츠를 좋아하는 MZ세대',
    emotional_angle: '처음의 고통과 점점 익숙해지는 과정의 솔직한 감정',
    why_it_resonates: '"나도 할 수 있겠다"는 동기부여와 함께 현실적 어려움을 인정해 신뢰감 형성',
    one_line_synopsis: '새벽 5시 기상 2주 챌린지 — Day 1 vs Day 14 정직 비교',
  },
];

export const DEMO_HOOKS: HookOption[] = [
  { id: 'hook_1', text: '새벽 5시, 당신은 지금 무엇을 하고 계세요?', style: '질문형' },
  { id: 'hook_2', text: '직장 다니면서 새벽 기상 3년째입니다.', style: '선언형' },
  { id: 'hook_3', text: '아침 30분이 하루를 바꿔준다는 거, 진짜였습니다.', style: '공감형' },
];

export const DEMO_SCRIPT_SPLIT: ScriptSplit = {
  full_script: `새벽 5시, 당신은 지금 무엇을 하고 계세요?

저는 3년 전부터 새벽 5시에 일어납니다. 처음엔 알람을 5번씩 껐어요. 근데 딱 한 가지만 바꿨더니 달라졌습니다.

일어나자마자 핸드폰을 보지 않는 것. 대신 물 한 잔 마시고, 10분 스트레칭, 그리고 그날 할 일 3가지만 적습니다.

이게 전부예요. 거창한 루틴 없이도 아침 30분이 하루 전체를 바꿔줬습니다.

여러분도 내일 아침, 딱 하나만 바꿔보세요.`,

  structure: {
    problem: '새벽 기상을 시도하지만 매번 실패하는 직장인들의 현실',
    empathy: '나도 알람을 5번 껐던 경험을 솔직히 공유하며 공감대 형성',
    solution: '핸드폰 대신 물 한 잔 + 스트레칭 + 할 일 3가지, 단순한 루틴 제시',
    action: '내일 아침 딱 하나만 바꿔보자는 실천 가능한 제안',
  },

  veo_core_clip: {
    text: '새벽 5시, 당신은 지금 무엇을 하고 계세요? 저는 3년 전부터 새벽 5시에 일어납니다. 처음엔 알람을 5번씩 껐어요.',
    prompt: 'Vertical 9:16 short-form video clip, 9 seconds. Korean person in their late 20s sitting at a tidy desk in the early morning, soft warm lamp light, speaking to camera in a calm and friendly tone. Minimal aesthetic room background, a glass of water on the desk. Authentic vlog style, gentle handheld camera, warm morning color grading.',
    duration: 9,
    status: 'idle',
  },

  slide_scenes: [
    {
      scene_id: 'slide_1',
      scene_title: '핸드폰 대신 물 한 잔',
      on_screen_text: '일어나자마자\n핸드폰 NO',
      narration_text: '일어나자마자 핸드폰을 보지 않는 것. 대신 물 한 잔부터 마십니다.',
      visual_description: 'Vertical 9:16, close-up of a hand reaching for a clear glass of water on a wooden bedside table, soft morning light through curtains, warm and calm atmosphere, minimal lifestyle aesthetic',
      duration_seconds: 4,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_2',
      scene_title: '10분 스트레칭',
      on_screen_text: '10분 스트레칭\n몸이 깨어납니다',
      narration_text: '물 한 잔 마시고, 10분 스트레칭. 몸이 자연스럽게 깨어납니다.',
      visual_description: 'Vertical 9:16, person stretching arms upward near a window with morning sunlight, peaceful yoga mat on a wooden floor, soft golden light, healthy lifestyle vlog aesthetic, calm and energizing mood',
      duration_seconds: 4,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_3',
      scene_title: '오늘 할 일 3가지',
      on_screen_text: '오늘 할 일\n딱 3가지만',
      narration_text: '그리고 그날 할 일 3가지만 노트에 적습니다. 이게 전부예요.',
      visual_description: 'Vertical 9:16, top-down flat lay of an open notebook with three items written, a pen beside it, a warm cup of coffee nearby, clean minimal desk, soft warm morning light, productive aesthetic',
      duration_seconds: 3,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_4',
      scene_title: '루틴의 효과',
      on_screen_text: '아침 30분이\n하루를 바꿉니다',
      narration_text: '거창한 루틴 없이도 아침 30분이 하루 전체를 바꿔줬습니다.',
      visual_description: 'Vertical 9:16, split screen style or before-after — left side dark alarm screen, right side bright productive morning desk setup, contrast between chaos and calm, motivational vlog aesthetic',
      duration_seconds: 4,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_5',
      scene_title: '3년 유지 비결',
      on_screen_text: '3년 동안\n포기하지 않은 이유',
      narration_text: '3년 동안 이 루틴을 유지할 수 있었던 건 딱 하나, 작게 시작했기 때문입니다.',
      visual_description: 'Vertical 9:16, calendar or journal with consistent morning check marks, warm lamp light, cozy productive home office feel, sense of habit and consistency, lifestyle blogger aesthetic',
      duration_seconds: 3,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_6',
      scene_title: '내일 아침 도전해보세요',
      on_screen_text: '내일 아침\n딱 하나만 바꿔보세요',
      narration_text: '여러분도 내일 아침, 딱 하나만 바꿔보세요.',
      visual_description: 'Vertical 9:16, sunrise seen through a window, person silhouette holding a coffee mug, hopeful and warm golden tones, motivational end card vibe, clean and inspiring composition',
      duration_seconds: 3,
      imageStatus: 'idle',
    },
  ],
};

export const DEMO_UPLOAD_COPY: UploadCopyPackage = {
  titles: [
    { id: 't1', text: '새벽 5시 기상 3년째 직장인의 아침 루틴 | 알람 5번 끄던 내가', style: '직접적' },
    { id: 't2', text: '아침 30분이 하루를 바꾼다는 거, 진짜였습니다', style: '공감형' },
    { id: 't3', text: '이 루틴 하나로 야근이 줄었습니다 — 직장인 새벽 기상 비결', style: '결과형' },
  ],
  hashtags: [
    '#새벽기상', '#아침루틴', '#직장인브이로그', '#자기계발', '#모닝루틴', '#생산성', '#습관', '#숏츠',
  ],
  platformVersions: [
    {
      platform: 'youtube', platformLabel: 'YouTube Shorts',
      title: '새벽 5시 기상 3년째 직장인의 아침 루틴 — 알람 5번 끄던 내가 바꾼 단 하나',
      caption: '새벽 기상 3년째 유지하는 직장인의 실제 아침 루틴을 공개합니다.\n\n거창한 계획 없이 딱 하나만 바꿨더니 하루가 달라졌어요.\n내일 아침 한번 따라 해보세요!\n\n#새벽기상 #아침루틴 #직장인 #자기계발 #Shorts',
      hashtags: ['#새벽기상', '#아침루틴', '#직장인', '#자기계발', '#Shorts'],
      cta: '구독하고 더 많은 루틴 영상을 받아보세요 🔔',
    },
    {
      platform: 'instagram', platformLabel: 'Instagram Reels',
      title: '아침 30분이 하루를 바꿉니다',
      caption: '새벽 5시 기상 3년째 💪\n.\n.\n처음엔 알람을 5번씩 껐는데 딱 하나 바꿨더니 달라졌어요.\n여러분 아침 루틴은 어떠세요?\n.\n.\n#새벽기상 #모닝루틴 #직장인브이로그 #자기계발 #생산성 #reels',
      hashtags: ['#새벽기상', '#모닝루틴', '#직장인브이로그', '#reels'],
      cta: '저장해두고 내일 아침 따라 해보세요 🌅',
    },
    {
      platform: 'tiktok', platformLabel: 'TikTok',
      title: '새벽 기상 3년 유지하는 법 알려드림 🌅',
      caption: '알람 5번 끄다가 지금은 새벽 5시 기상 3년째 ㅋㅋ 비결 30초 설명 #새벽기상 #모닝루틴 #직장인 #자기계발 #foryou',
      hashtags: ['#새벽기상', '#모닝루틴', '#직장인', '#foryou'],
      cta: '팔로우하면 매주 루틴 영상 올려요 👆',
    },
    {
      platform: 'kakao', platformLabel: '카카오 공유',
      title: '[영상] 새벽 5시 기상 3년째 직장인의 아침 루틴',
      caption: '알람을 5번씩 끄던 직장인이 새벽 기상 3년을 유지하게 된 단 하나의 비결을 담은 30초 영상입니다. 내일 아침 한번 따라 해보세요!\n\n#새벽기상 #아침루틴 #자기계발',
      hashtags: ['#새벽기상', '#아침루틴', '#자기계발'],
      cta: '카카오톡으로 공유하기',
    },
    {
      platform: 'threads', platformLabel: 'Threads',
      title: '새벽 5시 기상 3년째인데 비결 알려드림',
      caption: '처음엔 알람을 5번 껐어요.\n근데 딱 하나만 바꿨더니 달라졌습니다.\n일어나자마자 핸드폰 대신 물 한 잔.\n30초 영상에 다 담았으니 한번 봐요 🌅\n\n#새벽기상 #아침루틴 #직장인 #자기계발',
      hashtags: ['#새벽기상', '#아침루틴', '#직장인', '#자기계발'],
      cta: '팔로우하면 매주 루틴 영상 공유할게요',
    },
  ],
};

// ─── Mock Service Functions ────────────────────────────────────────────────────

export async function mockGenerateIdeas(): Promise<ContentIdea[]> {
  await delay(1600);
  return DEMO_IDEAS;
}

export async function mockGenerateHooks(): Promise<HookOption[]> {
  await delay(1200);
  return DEMO_HOOKS;
}

export async function mockGenerateScriptSplit(): Promise<ScriptSplit> {
  await delay(2000);
  return JSON.parse(JSON.stringify(DEMO_SCRIPT_SPLIT)) as ScriptSplit;
}

export async function mockAnalyzeImage(_file: File): Promise<string> {
  await delay(1000);
  return '일상 라이프스타일 이미지로 보입니다. 따뜻하고 자연스러운 분위기를 잘 담고 있으며, 슬라이드 씬 1(아침 루틴 시작)이나 씬 6(마무리 장면)에 활용하면 효과적입니다.';
}

export async function mockGenerateVeoClip(
  _clip: VeoCoreClip,
  onProgress: (msg: string) => void,
): Promise<void> {
  const steps = [
    '영상 생성 요청 중...',
    'Veo 3.1 Lite 처리 중 (5초)...',
    '영상 렌더링 중 (15초)...',
    '영상 인코딩 중 (25초)...',
    '완료!',
  ];
  for (const step of steps) {
    await delay(step === '완료!' ? 400 : 1200);
    onProgress(step);
  }
  // Mock: no actual video URL in demo mode
}

export async function mockGenerateSlideImage(
  _scene: SlideScene,
  onProgress?: (msg: string) => void,
): Promise<string> {
  onProgress?.('이미지 생성 중...');
  await delay(1400);
  // Return a colored placeholder SVG as data URI
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    <rect width="720" height="1280" fill="${color}" opacity="0.15"/>
    <rect width="720" height="1280" fill="none" stroke="${color}" stroke-width="3" opacity="0.3"/>
    <text x="360" y="600" text-anchor="middle" font-family="sans-serif" font-size="28" fill="${color}" opacity="0.6">슬라이드 이미지</text>
    <text x="360" y="660" text-anchor="middle" font-family="sans-serif" font-size="18" fill="${color}" opacity="0.4">(데모 모드)</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(new TextEncoder().encode(svg).reduce((acc, b) => acc + String.fromCharCode(b), ''))}`;
}

export async function mockGenerateUploadCopy(): Promise<UploadCopyPackage> {
  await delay(1800);
  return DEMO_UPLOAD_COPY;
}

export const DEMO_PLANNING_AUTOFILL = {
  identity: '1인 라이프스타일 유튜버 (직장인 병행)',
  category: '일상/브이로그' as const,
  topic: '새벽 5시에 일어나는 직장인의 아침 루틴 — 30분으로 하루가 달라진다',
  mainPoints: [
    '새벽 기상을 3년 동안 유지한 핵심 습관 3가지',
    '바쁜 직장인도 따라할 수 있는 현실적인 방법',
    '2주 동안 직접 해봤더니 달라진 점',
  ] as [string, string, string],
  hasPhotos: false,
  hasVideos: false,
  bannedExpressions: '과장된 전후 비교, 근거 없는 효과 주장',
  tone: '친근한, 유쾌한',
};
