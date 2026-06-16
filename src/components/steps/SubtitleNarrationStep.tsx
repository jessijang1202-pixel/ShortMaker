import { useEffect, useRef, useState } from 'react';
import { Type, Mic, Music2, ChevronRight, Check, Play, Pause, Loader2, Wand2, RefreshCw } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type {
  SubtitleNarrationSettings, SoundEffect, NarrationGender, NarrationMood,
  TextPosition, TextSize, SubtitleStyle,
} from '../../types';
import Button from '../ui/Button';
import { generateSoundEffect, suggestSoundEffects } from '../../services/elevenlabs.service';

// ─── Static data ───────────────────────────────────────────────────────────────

const MOODS: { value: NarrationMood; label: string; desc: string }[] = [
  { value: '차분한',   label: '차분한',   desc: '안정감 있는 목소리' },
  { value: '활기찬',   label: '활기찬',   desc: '밝고 에너지 넘치는' },
  { value: '진지한',   label: '진지한',   desc: '무게감 있는 전달' },
  { value: '감성적인', label: '감성적인', desc: '따뜻하고 감성적인' },
  { value: '뉴스처럼', label: '뉴스처럼', desc: '전문적이고 명확한' },
  { value: '친근한',   label: '친근한',   desc: '편안하고 다가가기 쉬운' },
];

const VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: '강민준', gender: 'male'   as NarrationGender, tags: ['뉴스처럼', '진지한'],   desc: '뉴스 앵커형 — 신뢰감 있는' },
  { id: 'VR6AewLTigWG4xSOukaG', name: '박준서', gender: 'male'   as NarrationGender, tags: ['차분한', '감성적인'],   desc: '내레이터형 — 차분하고 깊은' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: '이성민', gender: 'male'   as NarrationGender, tags: ['친근한', '활기찬'],    desc: '친근한 — 따뜻하고 편안한' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: '김서연', gender: 'female' as NarrationGender, tags: ['뉴스처럼', '진지한'],  desc: '아나운서형 — 전문적이고 명확한' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: '이지은', gender: 'female' as NarrationGender, tags: ['감성적인', '차분한'],  desc: '감성 내레이터 — 따뜻하고 섬세한' },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: '박소희', gender: 'female' as NarrationGender, tags: ['활기찬', '친근한'],   desc: '밝은 목소리 — 활기차고 친근한' },
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
  selectedVoiceId: 'EXAVITQu4vr4xnSDxMaL',
  selectedVoiceName: '김서연',
  soundEffectsEnabled: false,
  soundEffects: [],
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

function subtitleInlineStyle(style: SubtitleStyle): React.CSSProperties {
  if (style === 'outline')
    return { textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' };
  if (style === 'shadow')
    return { textShadow: '2px 2px 6px rgba(0,0,0,0.9)' };
  if (style === 'bold')
    return { fontWeight: 900 };
  return {};
}

// ─── Sound Effect Card ────────────────────────────────────────────────────────

function SoundEffectCard({
  sfx,
  playingId,
  hasApiKey,
  onPromptChange,
  onDurationChange,
  onGenerate,
  onPlayToggle,
}: {
  sfx: SoundEffect;
  playingId: string | null;
  hasApiKey: boolean;
  onPromptChange: (id: string, prompt: string) => void;
  onDurationChange: (id: string, dur: number) => void;
  onGenerate: (id: string, prompt: string, duration: number) => void;
  onPlayToggle: (id: string, url: string) => void;
}) {
  const isGenerating = sfx.status === 'generating';
  const isDone = sfx.status === 'done' && !!sfx.audioUrl;
  const isError = sfx.status === 'error';
  const isPlaying = playingId === sfx.id;

  return (
    <div className={`rounded-xl border-2 p-3 space-y-2.5 transition-colors ${
      isDone
        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/10'
        : 'border-slate-200 dark:border-slate-700'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{sfx.label}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{sfx.durationSeconds}초</span>
        {isDone && <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ 완료</span>}
        {isError && <span className="ml-auto text-xs text-red-500 font-medium">✗ 실패</span>}
        {isGenerating && <span className="ml-auto text-xs text-blue-500 font-medium animate-pulse">생성 중...</span>}
      </div>

      {/* Prompt */}
      <input
        type="text"
        value={sfx.prompt}
        onChange={e => onPromptChange(sfx.id, e.target.value)}
        disabled={isGenerating}
        className="input-base text-xs py-2"
        placeholder="효과음 설명 (영문 권장)"
      />

      {/* Duration + Actions */}
      <div className="flex items-center gap-2">
        <select
          value={sfx.durationSeconds}
          onChange={e => onDurationChange(sfx.id, Number(e.target.value))}
          disabled={isGenerating}
          className="text-xs px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          {[1, 2, 3, 4, 5].map(d => (
            <option key={d} value={d}>{d}초</option>
          ))}
        </select>

        <div className="flex-1" />

        {isDone && sfx.audioUrl && (
          <button
            type="button"
            onClick={() => onPlayToggle(sfx.id, sfx.audioUrl!)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? '정지' : '재생'}
          </button>
        )}

        <button
          type="button"
          onClick={() => onGenerate(sfx.id, sfx.prompt, sfx.durationSeconds)}
          disabled={!hasApiKey || isGenerating}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            isDone
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed'
          }`}
        >
          {isGenerating
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : isDone
            ? <RefreshCw className="w-3 h-3" />
            : <Wand2 className="w-3 h-3" />}
          {isGenerating ? '생성 중' : isDone ? '재생성' : '생성'}
        </button>
      </div>

      {isError && (
        <p className="text-xs text-red-500 dark:text-red-400">{sfx.errorMessage ?? '생성 중 오류가 발생했습니다.'}</p>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SubtitleNarrationStep() {
  const { session, settings: appSettings, setStep, setSubtitleNarration } = useApp();
  const [cfg, setCfg] = useState<SubtitleNarrationSettings>(
    session.subtitleNarration ?? DEFAULT_SETTINGS
  );
  const [generatingAll, setGeneratingAll] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-populate sound effects on first entry
  useEffect(() => {
    if (cfg.soundEffects.length === 0) {
      const topic = session.planning?.topic ?? '';
      const category = session.planning?.category ?? '뉴스';
      setCfg(prev => ({ ...prev, soundEffects: suggestSoundEffects(topic, category) }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup audio on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  function set<K extends keyof SubtitleNarrationSettings>(key: K, value: SubtitleNarrationSettings[K]) {
    setCfg(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'narrationGender') {
        const g = value as NarrationGender;
        const currentVoice = VOICES.find(v => v.id === prev.selectedVoiceId);
        if (!currentVoice || currentVoice.gender !== g) {
          const first = VOICES.find(v => v.gender === g);
          if (first) { next.selectedVoiceId = first.id; next.selectedVoiceName = first.name; }
        }
      }
      return next;
    });
  }

  // ── Sound effect actions ──────────────────────────────────────────────────

  function updateSfxPrompt(id: string, prompt: string) {
    setCfg(prev => ({
      ...prev,
      soundEffects: prev.soundEffects.map(s => s.id === id ? { ...s, prompt } : s),
    }));
  }

  function updateSfxDuration(id: string, durationSeconds: number) {
    setCfg(prev => ({
      ...prev,
      soundEffects: prev.soundEffects.map(s => s.id === id ? { ...s, durationSeconds } : s),
    }));
  }

  async function handleGenerateSfx(id: string, prompt: string, duration: number) {
    if (!appSettings.elevenLabsApiKey) return;

    setCfg(prev => ({
      ...prev,
      soundEffects: prev.soundEffects.map(s =>
        s.id === id ? { ...s, status: 'generating', errorMessage: undefined } : s
      ),
    }));

    try {
      const url = await generateSoundEffect(appSettings.elevenLabsApiKey, prompt, duration);
      setCfg(prev => ({
        ...prev,
        soundEffects: prev.soundEffects.map(s =>
          s.id === id ? { ...s, status: 'done', audioUrl: url } : s
        ),
      }));
    } catch (err) {
      setCfg(prev => ({
        ...prev,
        soundEffects: prev.soundEffects.map(s =>
          s.id === id
            ? { ...s, status: 'error', errorMessage: err instanceof Error ? err.message : '생성 실패' }
            : s
        ),
      }));
    }
  }

  async function handleGenerateAll() {
    if (!appSettings.elevenLabsApiKey || generatingAll) return;
    setGeneratingAll(true);
    for (const sfx of cfg.soundEffects) {
      if (sfx.status !== 'done') {
        await handleGenerateSfx(sfx.id, sfx.prompt, sfx.durationSeconds);
      }
    }
    setGeneratingAll(false);
  }

  function handlePlayToggle(id: string, url: string) {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {});
      setPlayingId(id);
      audio.onended = () => setPlayingId(null);
    }
  }

  function handleResetSfx() {
    const topic = session.planning?.topic ?? '';
    const category = session.planning?.category ?? '뉴스';
    setCfg(prev => ({ ...prev, soundEffects: suggestSoundEffects(topic, category) }));
  }

  function handleNext() {
    audioRef.current?.pause();
    setSubtitleNarration(cfg);
    setStep('storyboard');
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredVoices = VOICES.filter(v => v.gender === cfg.narrationGender);
  const hasElevenLabs = !!appSettings.elevenLabsApiKey;
  const previewPos =
    cfg.subtitlePosition === 'top'    ? 'top-3' :
    cfg.subtitlePosition === 'center' ? 'top-1/2 -translate-y-1/2' :
                                        'bottom-3';
  const previewSize =
    cfg.subtitleSize === 'large'  ? 'text-lg font-bold' :
    cfg.subtitleSize === 'medium' ? 'text-sm font-semibold' :
                                    'text-xs font-medium';
  const doneCount = cfg.soundEffects.filter(s => s.status === 'done').length;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">자막과 나레이션</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          영상의 자막 스타일, 나레이션 음성, 효과음을 설정합니다.
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
                    style={subtitleInlineStyle(cfg.subtitleStyle)}
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

      {/* ── 나레이션 설정 ─────────────────────────────────────────────── */}
      <div className="wizard-card">
        <div className="flex items-center gap-2 mb-5">
          <Mic className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">나레이션 설정</h3>
          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
            ElevenLabs
          </span>
          <div className="ml-auto">
            <Toggle on={cfg.narrationEnabled} onChange={v => set('narrationEnabled', v)} color="purple" />
          </div>
        </div>

        {cfg.narrationEnabled ? (
          <div className="space-y-5">
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

            {/* Voice */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
              <p className="section-label">음성 선택</p>
              {!hasElevenLabs && (
                <div className="mb-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                  <p className="font-semibold mb-0.5">ElevenLabs API 키 미설정</p>
                  <p className="text-xs leading-relaxed">설정 페이지에서 API 키를 입력하면 실제 AI 음성을 생성할 수 있습니다. 지금은 원하는 음성 스타일을 선택해 두세요.</p>
                </div>
              )}
              <div className="space-y-2">
                {filteredVoices.map(voice => {
                  const isActive = cfg.selectedVoiceId === voice.id;
                  const moodMatch = voice.tags.includes(cfg.narrationMood);
                  return (
                    <button
                      key={voice.id}
                      type="button"
                      onClick={() => setCfg(prev => ({ ...prev, selectedVoiceId: voice.id, selectedVoiceName: voice.name }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        isActive
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${isActive ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        {cfg.narrationGender === 'male' ? '👨' : '👩'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-sm font-semibold ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}`}>{voice.name}</span>
                          {moodMatch && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">추천</span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 leading-tight">{voice.desc}</p>
                      </div>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">나레이션을 사용하지 않습니다.</p>
        )}
      </div>

      {/* ── 효과음 설정 ───────────────────────────────────────────────── */}
      <div className="wizard-card">
        <div className="flex items-center gap-2 mb-5">
          <Music2 className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">효과음</h3>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
            ElevenLabs
          </span>
          {cfg.soundEffectsEnabled && doneCount > 0 && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {doneCount}/{cfg.soundEffects.length} 완료
            </span>
          )}
          <div className="ml-auto">
            <Toggle on={cfg.soundEffectsEnabled} onChange={v => set('soundEffectsEnabled', v)} color="emerald" />
          </div>
        </div>

        {cfg.soundEffectsEnabled ? (
          <div className="space-y-4">
            {/* Info */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              대본 내용을 분석해 자동으로 추천된 효과음입니다. 프롬프트를 수정하거나 그대로 생성할 수 있습니다.
            </p>

            {!hasElevenLabs && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                <p className="font-semibold mb-0.5">ElevenLabs API 키 미설정</p>
                <p className="text-xs leading-relaxed">설정 페이지에서 ElevenLabs API 키를 입력하면 효과음을 생성할 수 있습니다.</p>
              </div>
            )}

            {/* Sound effect cards */}
            <div className="space-y-3">
              {cfg.soundEffects.map(sfx => (
                <SoundEffectCard
                  key={sfx.id}
                  sfx={sfx}
                  playingId={playingId}
                  hasApiKey={hasElevenLabs}
                  onPromptChange={updateSfxPrompt}
                  onDurationChange={updateSfxDuration}
                  onGenerate={handleGenerateSfx}
                  onPlayToggle={handlePlayToggle}
                />
              ))}
            </div>

            {/* Bulk actions */}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleGenerateAll}
                disabled={!hasElevenLabs || generatingAll}
                loading={generatingAll}
                leftIcon={<Wand2 className="w-3.5 h-3.5" />}
                className="flex-1"
              >
                전체 효과음 생성
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetSfx}
                disabled={generatingAll}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                초기화
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">효과음을 사용하지 않습니다.</p>
        )}
      </div>

      {/* Next */}
      <Button
        size="lg"
        className="w-full"
        rightIcon={<ChevronRight className="w-5 h-5" />}
        onClick={handleNext}
      >
        30초 스토리보드로 이동
      </Button>
    </div>
  );
}
