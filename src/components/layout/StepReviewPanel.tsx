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
    stepNo: 1, stepTitle: '주제 확인',
    checks: [
      { id: 'topic',   label: '이 영상의 주제가 한 문장으로 딱 떠오르나요?' },
      { id: 'summary', label: '하고 싶은 말을 15초 안에 설명할 수 있나요?' },
    ],
    confirmPrompt: '이 방향으로 영상을 만들어도 괜찮을까요?',
    canRegenerate: false,
  },
  ideas: {
    stepNo: 2, stepTitle: '아이디어 확인',
    checks: [
      { id: 'target', label: '이 영상을 볼 사람이 누구인지 대충 그려지나요? (예: 20대 직장인)' },
      { id: 'key',    label: '영상 분위기(재미있게? 감동적으로? 등)가 마음에 드나요?' },
    ],
    confirmPrompt: '선택한 아이디어, 마음에 드시나요?',
    canRegenerate: true,
  },
  hooks: {
    stepNo: 3, stepTitle: '오프닝 문장 확인',
    checks: [
      { id: 'hook_place', label: '시작하자마자 시선을 확 끄는 느낌인가요?' },
      { id: 'word_count', label: '20초짜리 영상에 어울리는 분량인가요?' },
    ],
    confirmPrompt: '이 오프닝 문장, 마음에 드시나요?',
    canRegenerate: true,
  },
  'script-split': {
    stepNo: 4, stepTitle: '대본 확인',
    checks: [
      { id: 'info_density', label: '한 문장에 이야기가 너무 많이 들어가 있지 않나요?' },
      { id: 'cta',          label: '마지막에 "좋아요·팔로우" 같은 문구가 들어있나요?' },
      { id: 'copyright',    label: '다른 브랜드 이름이나 노래 가사가 들어가 있진 않나요?' },
    ],
    confirmPrompt: '이 대본 그대로 진행해도 될까요?',
    canRegenerate: true,
  },
  'veo-clip': {
    stepNo: 5, stepTitle: '도입부 영상 확인',
    checks: [
      { id: 'scene_map', label: '장면들이 대본 흐름과 자연스럽게 이어지나요?' },
      { id: 'source',    label: '사용한 영상이 저작권 걱정 없이 쓸 수 있는 건가요?' },
    ],
    confirmPrompt: 'AI가 만든 도입부 영상, 마음에 드시나요?',
    canRegenerate: true,
  },
  slides: {
    stepNo: 6, stepTitle: '사진·이미지 확인',
    checks: [
      { id: 'source_rights', label: '사용한 사진이 저작권 걱정 없이 쓸 수 있는 건가요?' },
      { id: 'ref_color',     label: '사진 색감과 분위기가 참고 영상과 비슷한가요?' },
    ],
    confirmPrompt: '장면별 사진과 문구, 마음에 드시나요?',
    canRegenerate: true,
  },
  'subtitle-narration': {
    stepNo: 7, stepTitle: '자막 확인',
    checks: [
      { id: 'sub_length', label: '자막이 한눈에 읽기 좋은 길이인가요? (너무 길지 않게)' },
      { id: 'safe_zone',  label: '자막이 화면 밖으로 잘리지 않고 잘 보이나요?' },
    ],
    confirmPrompt: '자막 스타일과 목소리 설정, 마음에 드시나요?',
    canRegenerate: false,
  },
  storyboard: {
    stepNo: 8, stepTitle: '전체 디자인 확인',
    checks: [
      { id: 'brand_preset', label: '글씨체와 색깔이 처음에 정한 스타일과 잘 맞나요?' },
      { id: 'ref_match',    label: '전체 분위기가 참고 영상과 비슷하게 나왔나요?' },
    ],
    confirmPrompt: '완성된 영상 구성, 마음에 드시나요?',
    canRegenerate: false,
  },
  'upload-copy': {
    stepNo: 9, stepTitle: '업로드 문구 확인',
    checks: [
      { id: 'bgm_mood', label: '배경음악 분위기가 영상 내용과 잘 어울리나요?' },
      { id: 'bgm_ref',  label: '음악·효과음이 참고 영상 느낌과 비슷한가요?' },
      { id: 'bgm_key',  label: '전에 만든 영상들과 분위기가 너무 다르지 않나요?' },
    ],
    confirmPrompt: '올릴 때 쓸 제목과 해시태그, 마음에 드시나요?',
    canRegenerate: true,
  },
  export: {
    stepNo: 10, stepTitle: '마지막 점검',
    checks: [
      { id: 'duration',  label: '완성된 영상 길이가 원했던 길이와 비슷한가요?' },
      { id: 'sub_time',  label: '자막이 나오는 타이밍이 목소리·영상과 잘 맞나요?' },
      { id: 'platform',  label: '화질이 유튜브·인스타 등에 올리기에 충분히 선명한가요?' },
    ],
    confirmPrompt: '이제 영상을 내보내도 될까요?',
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
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="bg-[#241E3C] px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#8489F2]" />
            <span className="text-xs font-bold text-[#B4B7F8] uppercase tracking-wider">
              {config.stepNo}단계 검토
            </span>
          </div>
          <h2 className="text-lg font-black leading-tight">{config.stepTitle}</h2>
          <p className="text-sm text-slate-300 mt-0.5">다음으로 넘어가기 전에 잠깐 살펴봐 주세요</p>
        </div>

        {/* Checklist */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            이런 점을 확인해 주세요
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
                  ? <CheckCircle2 className="w-5 h-5 text-[#1E9950]" />
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
        <div className="mx-6 mb-5 bg-[#ECEDFD] dark:bg-[#8489F2]/10 border-2 border-[#C7C9FA] dark:border-[#8489F2]/30 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-[#5157D8] dark:text-[#B4B7F8] mb-1">이렇게 진행할까요?</p>
          <p className="text-sm text-[#3D42B0] dark:text-[#DEDFFC] leading-relaxed">{config.confirmPrompt}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          {/* 승인 */}
          <button
            onClick={onConfirm}
            disabled={!allChecked}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${
              allChecked
                ? 'bg-[#8BE8AC] hover:bg-[#6FE097] active:scale-[0.98] text-[#14351F] shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            네, 다음으로 갈게요
            {!allChecked && <span className="text-xs opacity-70 ml-1">(위 항목을 모두 확인하면 눌러주세요)</span>}
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* 수정 요청 */}
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              직접 수정할게요
            </button>

            {/* 다시 만들기 */}
            {config.canRegenerate ? (
              <button
                onClick={onRegenerate}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-[#F79A4D]/40 text-sm font-bold text-[#B0621E] dark:text-[#F79A4D] hover:bg-[#FDEBD7] dark:hover:bg-[#F79A4D]/10 transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                다시 만들어줘
              </button>
            ) : (
              <div className="flex items-center justify-center py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400 dark:text-slate-500">
                다시 만들 수 없어요
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
