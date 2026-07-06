import { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, RefreshCcw, Edit3, ShieldCheck } from 'lucide-react';
import type { WizardStep } from '../../types';

// ─── Checklist config (ADVANCED_VIDEO_10STEP_CHECKLIST.md) ────────────────────

interface CheckItem { id: string; label: string }

interface ReviewConfig {
  stepNo: number;
  stepTitle: string;
  checks: CheckItem[];
  confirmPrompt: string;
  canRegenerate: boolean;
}

const CONFIGS: Partial<Record<WizardStep, ReviewConfig>> = {
  planning: {
    stepNo: 1, stepTitle: '주제/컨텍스트 확인',
    checks: [
      { id: 'topic',   label: '주제가 한 문장으로 명확한가?' },
      { id: 'summary', label: '핵심 메시지가 15초 이내로 요약되는가?' },
    ],
    confirmPrompt: '핵심 메시지를 이 방향으로 진행할까요?',
    canRegenerate: false,
  },
  ideas: {
    stepNo: 2, stepTitle: '타겟/키 설정',
    checks: [
      { id: 'target', label: '타겟 청중(연령대/관심사)이 지정되었는가?' },
      { id: 'key',    label: '키(정보성/유머/감성 등) 프리셋이 선택되었는가?' },
    ],
    confirmPrompt: '선택한 아이디어와 타겟 방향이 맞나요?',
    canRegenerate: true,
  },
  hooks: {
    stepNo: 3, stepTitle: '스크립트 이슈 확인',
    checks: [
      { id: 'hook_place', label: '훅이 첫 3초 안에 배치되어 있는가?' },
      { id: 'word_count', label: '단어 수가 목표 범위(75~90단어) 안인가?' },
    ],
    confirmPrompt: '이 오프닝 문장이 두 가지입니다. 어느 쪽이 더 끌리나요?',
    canRegenerate: true,
  },
  'script-split': {
    stepNo: 4, stepTitle: '스크립트 확정',
    checks: [
      { id: 'info_density', label: '문장당 정보가 하나만 담겨 있는가?' },
      { id: 'cta',          label: '마지막에 행동 유도 문구(CTA)가 있는가?' },
      { id: 'copyright',    label: '브랜드명·가사·작품 인용이 없는가?' },
    ],
    confirmPrompt: '이 대본으로 확정할까요, 수정이 필요한 부분이 있나요?',
    canRegenerate: true,
  },
  'veo-clip': {
    stepNo: 5, stepTitle: '씬 분할/스토리보드',
    checks: [
      { id: 'scene_map', label: '씬 타이밍이 스크립트 문장 흐름과 논리적으로 맞는가?' },
      { id: 'source',    label: '영상 소스가 저작권 문제 없이 확보 가능한가?' },
    ],
    confirmPrompt: 'Veo 클립 구성이 자연스러운가요?',
    canRegenerate: true,
  },
  slides: {
    stepNo: 6, stepTitle: '비주얼 소스 선정',
    checks: [
      { id: 'source_rights', label: '각 씬 이미지 소스가 저작권 문제 없이 확보 가능한가?' },
    ],
    confirmPrompt: '슬라이드 이미지와 텍스트 구성이 만족스러운가요?',
    canRegenerate: true,
  },
  'subtitle-narration': {
    stepNo: 7, stepTitle: '텍스트 오버레이/자막',
    checks: [
      { id: 'sub_length', label: '씬당 자막 길이가 12자 내외인가?' },
      { id: 'safe_zone',  label: '세로 화면 safe zone 안에 배치되는가?' },
    ],
    confirmPrompt: '자막 스타일과 나레이션 설정이 괜찮은가요?',
    canRegenerate: false,
  },
  storyboard: {
    stepNo: 8, stepTitle: '스타일(폰트/컬러) 적용',
    checks: [
      { id: 'brand_preset', label: '폰트/컬러/자막 스타일이 지정된 프리셋과 일치하는가?' },
    ],
    confirmPrompt: '전체 스토리보드와 스타일이 마음에 드나요?',
    canRegenerate: false,
  },
  'upload-copy': {
    stepNo: 9, stepTitle: 'BGM/효과음 적용',
    checks: [
      { id: 'bgm_mood', label: '음악 분위기가 콘텐츠 키와 맞는가?' },
      { id: 'bgm_key',  label: '이전 영상들과 키가 급격히 다르지 않은가?' },
    ],
    confirmPrompt: '업로드 카피와 해시태그가 플랫폼에 맞게 준비되었나요?',
    canRegenerate: true,
  },
  export: {
    stepNo: 10, stepTitle: '최종 기술 검증',
    checks: [
      { id: 'duration',  label: '최종 길이가 목표 범위 ±10% 안인가?' },
      { id: 'sub_time',  label: '자막 타이밍이 음성/영상과 맞는가?' },
      { id: 'platform',  label: '해상도/비트레이트가 플랫폼 기준을 충족하는가?' },
    ],
    confirmPrompt: '모든 항목 확인 후 내보내기를 진행할까요?',
    canRegenerate: false,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  currentStep: WizardStep;
  onConfirm: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
}

export default function StepReviewPanel({ currentStep, onConfirm, onEdit, onRegenerate }: Props) {
  const config = CONFIGS[currentStep];
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!config) {
    // No config → auto-confirm
    onConfirm();
    return null;
  }

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const allChecked = config.checks.every(c => checked[c.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">
              {config.stepNo}단계 검토
            </span>
          </div>
          <h2 className="text-lg font-bold leading-tight">{config.stepTitle}</h2>
          <p className="text-sm text-indigo-200 mt-0.5">다음 단계로 이동하기 전에 확인해 주세요</p>
        </div>

        {/* Checklist */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            체크 항목
          </p>
          {config.checks.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-start gap-3 text-left group"
            >
              <div className="shrink-0 mt-0.5">
                {checked[item.id]
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
                }
              </div>
              <span className={`text-sm leading-snug transition-colors ${
                checked[item.id]
                  ? 'text-slate-400 dark:text-slate-500 line-through'
                  : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Confirm prompt */}
        <div className="mx-6 mb-5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">확인 요청</p>
          <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">{config.confirmPrompt}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          {/* 승인 */}
          <button
            onClick={onConfirm}
            disabled={!allChecked}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              allChecked
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            승인 — 다음 단계로
            {!allChecked && <span className="text-xs opacity-70 ml-1">(체크 완료 후 활성화)</span>}
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* 수정 요청 */}
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              수정 요청
            </button>

            {/* 다시 만들기 */}
            {config.canRegenerate ? (
              <button
                onClick={onRegenerate}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                다시 만들기
              </button>
            ) : (
              <div className="flex items-center justify-center py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400 dark:text-slate-500">
                재생성 불가
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
