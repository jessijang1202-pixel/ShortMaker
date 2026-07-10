// ─── Enumerations & Constants ─────────────────────────────────────────────────

export type Category =
  | '일상/브이로그'
  | '음식/먹방'
  | '여행/탐방'
  | '뷰티/패션'
  | '게임/엔터'
  | '피트니스/운동'
  | '교육/꿀팁'
  | '반려동물';

export const CATEGORIES: Category[] = [
  '일상/브이로그', '음식/먹방', '여행/탐방', '뷰티/패션',
  '게임/엔터', '피트니스/운동', '교육/꿀팁', '반려동물',
];

export const TONE_OPTIONS = [
  '친근한', '유쾌한', '감성적인', '정보전달형', '에너지 넘치는', '차분한',
] as const;

export type GenerationStatus = 'idle' | 'pending' | 'generating' | 'done' | 'error';

// ─── Planning ─────────────────────────────────────────────────────────────────

export interface VisualAsset {
  id: string;
  type: 'image' | 'video';
  file?: File;
  url?: string;
  name: string;
  aiSummary?: string;
  editedSummary?: string;
}

export interface PlanningInput {
  identity: string;
  category: Category;
  topic: string;
  mainPoints: [string, string, string];
  hasPhotos: boolean;
  hasVideos: boolean;
  bannedExpressions: string;
  tone: string;             // comma-joined multi-select, e.g. "따뜻한, 진중한"
}

// ─── Ideas & Hooks ────────────────────────────────────────────────────────────

export interface ContentIdea {
  id: string;
  idea_title: string;
  main_angle: string;
  target_audience: string;
  emotional_angle: string;
  why_it_resonates: string;
  one_line_synopsis: string;
}

export interface HookOption {
  id: string;
  text: string;
  style: string;
}

// ─── Script + Split ───────────────────────────────────────────────────────────

export type TextPosition = 'top' | 'center' | 'bottom';
export type TextSize = 'large' | 'medium' | 'small';

export interface CaptionBurst {
  text: string;   // 2~5단어 내외의 짧고 강렬한 캡션 조각
  start: number;  // 클립 시작 기준 초
  end: number;
}

export interface VeoCoreClip {
  text: string;             // spoken narration for the 8-10s clip
  prompt: string;           // full Veo generation prompt (English)
  duration: number;         // 8–10 seconds
  videoUrl?: string;        // blob URL or data URI after generation/upload
  status: GenerationStatus;
  errorMessage?: string;
  textPosition?: TextPosition;  // overlay text position on video
  textSize?: TextSize;           // overlay text size on video
  captions?: CaptionBurst[];     // 훅 구간에 순차 노출되는 짧은 임팩트 캡션들
}

export interface SlideScene {
  scene_id: string;
  scene_title: string;
  on_screen_text: string;   // big text displayed on screen
  narration_text: string;   // optional spoken narration
  visual_description: string;
  duration_seconds: number;
  imageUrl?: string;        // base64 or blob URL
  imageStatus: GenerationStatus;
}

export interface ScriptSplit {
  full_script: string;
  structure: {
    problem: string;
    empathy: string;
    solution: string;
    action: string;
  };
  veo_core_clip: VeoCoreClip;
  slide_scenes: SlideScene[];
}

// ─── Storyboard ───────────────────────────────────────────────────────────────

export interface StoryboardSegment {
  id: string;
  type: 'veo' | 'slide';
  label: string;
  startTime: number;
  endTime: number;
  videoUrl?: string;
  imageUrl?: string;
  on_screen_text?: string;
  narration?: string;
  textPosition?: TextPosition;
  textSize?: TextSize;
  captions?: CaptionBurst[];
}

// ─── Upload Copy ──────────────────────────────────────────────────────────────

export interface UploadTitle {
  id: string;
  text: string;
  style: string;
}

export interface PlatformCopy {
  platform: 'youtube' | 'instagram' | 'tiktok' | 'kakao' | 'threads';
  platformLabel: string;
  title: string;
  caption: string;
  hashtags: string[];
  cta: string;
}

export interface UploadCopyPackage {
  titles: UploadTitle[];
  hashtags: string[];
  platformVersions: PlatformCopy[];
}

// ─── Subtitle & Narration ─────────────────────────────────────────────────────

export type NarrationGender = 'male' | 'female';
export type NarrationMood = '차분한' | '활기찬' | '진지한' | '감성적인' | '뉴스처럼' | '친근한';
export type SubtitleStyle = 'default' | 'bold' | 'outline' | 'shadow';

export interface SubtitleNarrationSettings {
  subtitleEnabled: boolean;
  subtitlePosition: TextPosition;
  subtitleSize: TextSize;
  subtitleStyle: SubtitleStyle;
  // 나레이션·BGM·효과음은 Veo 영상 생성 시 함께 생성됨 (아래는 프롬프트 힌트)
  narrationEnabled: boolean;
  narrationGender: NarrationGender;
  narrationMood: NarrationMood;
  narrationSpeed: number;          // 0.7 ~ 1.5
  soundEffectsEnabled: boolean;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface UserApiSettings {
  geminiApiKey: string;
  useMockMode: boolean;
}

// ─── Wizard Navigation ────────────────────────────────────────────────────────

export type WizardStep =
  | 'planning'
  | 'ideas'
  | 'hooks'
  | 'script-split'
  | 'veo-clip'
  | 'slides'
  | 'subtitle-narration'
  | 'storyboard'
  | 'upload-copy'
  | 'export';

export interface WizardStepMeta {
  id: WizardStep;
  label: string;
  shortLabel: string;
  stepNumber: number;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  { id: 'planning',            label: '기획 입력',        shortLabel: '기획',       stepNumber: 1 },
  { id: 'ideas',               label: '아이디어 선택',     shortLabel: '아이디어',   stepNumber: 2 },
  { id: 'hooks',               label: '훅 선택',           shortLabel: '훅',         stepNumber: 3 },
  { id: 'script-split',        label: '대본 + 구성 분리',  shortLabel: '대본',       stepNumber: 4 },
  { id: 'veo-clip',            label: '영상 핵심 초반부',  shortLabel: '초반부',     stepNumber: 5 },
  { id: 'slides',              label: '영상 후반부',       shortLabel: '후반부',     stepNumber: 6 },
  { id: 'subtitle-narration',  label: '자막과 나레이션',   shortLabel: '자막/나레이션', stepNumber: 7 },
  { id: 'storyboard',          label: '30초 스토리보드',   shortLabel: '스토리보드', stepNumber: 8 },
  { id: 'upload-copy',         label: '업로드 카피',       shortLabel: '카피',       stepNumber: 9 },
  { id: 'export',              label: '내보내기',          shortLabel: '내보내기',   stepNumber: 10 },
];

// ─── Reference Style ──────────────────────────────────────────────────────────

export interface ReferenceStyle {
  concept: string;              // 콘셉트/무드 요약 (한글)
  colorPalette: string[];       // 주요 색상 (hex 또는 짧은 설명)
  subtitle: {
    position: TextPosition;
    size: TextSize;
    style: SubtitleStyle;
    description: string;        // 폰트 느낌, 강조 방식 등
  };
  bgm: string;                  // 배경 음악 분위기
  soundEffects: string[];       // 효과음 특징
  editingPace: string;          // 편집 템포
  promptGuide: string;          // 영문 스타일 가이드 — 생성 프롬프트에 그대로 주입
}

// ─── Full Session ─────────────────────────────────────────────────────────────

export interface AppSession {
  planning: PlanningInput | null;
  ideas: ContentIdea[];
  selectedIdea: ContentIdea | null;
  hooks: HookOption[];
  selectedHook: HookOption | null;
  scriptSplit: ScriptSplit | null;
  subtitleNarration: SubtitleNarrationSettings | null;
  uploadCopy: UploadCopyPackage | null;
  currentStep: WizardStep;
}
