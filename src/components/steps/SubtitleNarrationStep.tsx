import { useState } from 'react';
import { Type, Mic, Music2, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type {
  SubtitleNarrationSettings, NarrationGender, NarrationMood,
  TextPosition, TextSize, SubtitleStyle,
} from '../../types';
import Button from '../ui/Button';
import { subtitlePositionClass, subtitleSizeClass, subtitleStyleProps } from '../../utils/subtitleStyle';

// ─── Static data ───────────────────────────────────────────────────────────────

const MOODS: { value: NarrationMood; label: string; desc: string }[] = [
  { value: '차분한',   label: '차분한',   desc: '안정감 있는 목소리' },
  { value: '활기찬',   label: '활기찬',   desc: '밝고 에너지 넘치는' },
  { value: '진지한',   label: '진지한',   desc: '무게감 있는 전달' },
  { value: '감성적인', label: '감성적인', desc: '따뜻하고 감성적인' },
  { value: '뉴스처럼', label: '뉴스처럼', desc: '전문적이고 명확한' },
  { value: '친근한',   label: '친근한',   desc: '편안하고 다가가기 쉬운' },
];

const DEFAULT_SETTINGS: SubtitleNarrationSettings = {
  subtitleEnabled: true,
  subtitlePosition: 'bottom',
  subtitleSize: 'medium',
  subtitleStyle: 'outline',
  narrationEnabled: true,
  narrationGender: 'female',
  narrationMood: '차분한',
  narrationSpeed: 1.0,
  soundEffectsEnabled: true,
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function SegBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ on, onChange, color = 'blue' }: {
  on: boolean; onChange: (v: boolean) => void; color?: 'blue' | 'purple' | 'emerald';
}) {
  const bg = on
    ? color === 'purple'  ? 'bg-purple-600'
    : color === 'emerald' ? 'bg-emerald-600'
    :                       'bg-blue-600'
    : 'bg-slate-300 dark:bg-slate-600';
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${bg}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SubtitleNarrationStep() {
  const { session, setStep, setSubtitleNarration, reference } = useApp();
  const [cfg, setCfg] = useState<SubtitleNarrationSettings>(() => {
    if (session.subtitleNarration) return session.subtitleNarration;
    // 레퍼런스 분석이 있으면 그 스타일을 기본값으로 미리 채워준다
    if (reference.analysis) {
      return {
        ...DEFAULT_SETTINGS,
        subtitlePosition: reference.analysis.subtitle.position,
        subtitleSize: reference.analysis.subtitle.size,
        subtitleStyle: reference.analysis.subtitle.style,
      };
    }
    return DEFAULT_SETTINGS;
  });

  function set<K extends keyof SubtitleNarrationSettings>(key: K, value: SubtitleNarrationSettings[K]) {
    setCfg(prev => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    setSubtitleNarration(cfg);
    setStep('storyboard');
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const previewPos = subtitlePositionClass(cfg.subtitlePosition);
  const previewSize = subtitleSizeClass(cfg.subtitleSize);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">자막과 오디오</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          자막 스타일을 설정합니다. 나레이션·배경음악·효과음은 Veo AI 영상 생성 시 함께 만들어집니다.
        </p>
      </div>

      {/* ── 자막 설정 ─────────────────────────────────────────────────── */}
      <div className="wizard-card">
        <div className="flex items-center gap-2 mb-5">
          <Type className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">자막 설정</h3>
          <div className="ml-auto">
            <Toggle on={cfg.subtitleEnabled} onChange={v => set('subtitleEnabled', v)} />
          </div>
        </div>

        {cfg.subtitleEnabled ? (
          <div className="space-y-5">
            <div>
              <p className="section-label">위치</p>
              <div className="flex gap-1.5">
                {(['top', 'center', 'bottom'] as TextPosition[]).map(pos => (
                  <SegBtn key={pos} active={cfg.subtitlePosition === pos} onClick={() => set('subtitlePosition', pos)}>
                    {pos === 'top' ? '위' : pos === 'center' ? '중앙' : '아래'}
                  </SegBtn>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">크기</p>
              <div className="flex gap-1.5">
                {(['large', 'medium', 'small'] as TextSize[]).map(sz => (
                  <SegBtn key={sz} active={cfg.subtitleSize === sz} onClick={() => set('subtitleSize', sz)}>
                    {sz === 'large' ? '크게' : sz === 'medium' ? '보통' : '작게'}
                  </SegBtn>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">스타일</p>
              <div className="flex gap-1.5">
                {([['default', '기본'], ['bold', '굵게'], ['outline', '외곽선'], ['shadow', '그림자']] as [SubtitleStyle, string][]).map(([val, label]) => (
                  <SegBtn key={val} active={cfg.subtitleStyle === val} onClick={() => set('subtitleStyle', val)}>
                    {label}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <p className="section-label">미리보기</p>
              <div className="relative bg-slate-900 rounded-xl overflow-hidden" style={{ aspectRatio: '9/5' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-700 text-xs">영상 영역</span>
                </div>
                <div className={`absolute left-0 right-0 px-4 text-center ${previewPos}`}>
                  <span
                    className={`text-white ${previewSize}`}
                    style={subtitleStyleProps(cfg.subtitleStyle)}
                  >
                    자막 텍스트가 여기에 표시됩니다
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">자막을 사용하지 않습니다.</p>
        )}
      </div>

      {/* ── 나레이션 (Veo 오디오) ─────────────────────────────────────── */}
      <div className="wizard-card">
        <div className="flex items-center gap-2 mb-5">
          <Mic className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">나레이션</h3>
          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
            Veo AI 오디오
          </span>
          <div className="ml-auto">
            <Toggle on={cfg.narrationEnabled} onChange={v => set('narrationEnabled', v)} color="purple" />
          </div>
        </div>

        {cfg.narrationEnabled ? (
          <div className="space-y-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              선택한 성별·톤은 Veo 영상 생성 프롬프트에 반영되어, 영상 속 인물의 목소리 스타일을 결정합니다.
            </p>

            {/* Gender */}
            <div>
              <p className="section-label">성별</p>
              <div className="flex gap-2">
                {([['male', '👨 남자', 'blue'], ['female', '👩 여자', 'pink']] as const).map(([g, label, color]) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('narrationGender', g as NarrationGender)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      cfg.narrationGender === g
                        ? color === 'blue'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                          : 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <p className="section-label">기분 / 톤</p>
              <div className="grid grid-cols-3 gap-2">
                {MOODS.map(({ value, label, desc }) => {
                  const active = cfg.narrationMood === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('narrationMood', value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        active
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <p className={`text-sm font-semibold leading-tight ${active ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>{label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 leading-tight">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="section-label mb-0">말하기 속도</p>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{cfg.narrationSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range" min="0.7" max="1.5" step="0.1"
                value={cfg.narrationSpeed}
                onChange={e => set('narrationSpeed', parseFloat(e.target.value))}
                className="w-full accent-purple-600 h-2 rounded-full"
              />
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-600 mt-1">
                <span>0.7x 느리게</span><span>1.0x 기본</span><span>1.5x 빠르게</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">나레이션을 사용하지 않습니다.</p>
        )}
      </div>

      {/* ── 배경음악 & 효과음 (Veo 오디오) ─────────────────────────────── */}
      <div className="wizard-card">
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">배경음악 & 효과음</h3>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
            Veo AI 오디오
          </span>
          <div className="ml-auto">
            <Toggle on={cfg.soundEffectsEnabled} onChange={v => set('soundEffectsEnabled', v)} color="emerald" />
          </div>
        </div>

        {cfg.soundEffectsEnabled ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Veo가 화면 동작에 맞춰 배경음악과 효과음을 자동으로 생성합니다.
              차가 지나가면 소리도 함께 이동하는 공간 음향까지 지원됩니다.
            </p>
            {reference.analysis && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> 레퍼런스 스타일 적용됨
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">BGM: {reference.analysis.bgm}</p>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">효과음: {reference.analysis.soundEffects.join(', ')}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">배경음악·효과음 없이 영상만 생성합니다.</p>
        )}
      </div>

      {/* Next */}
      <Button
        size="lg"
        className="w-full"
        rightIcon={<ChevronRight className="w-5 h-5" />}
        onClick={handleNext}
      >
        스토리보드로 이동
      </Button>
    </div>
  );
}
