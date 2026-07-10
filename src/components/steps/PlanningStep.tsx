import { useRef, useState } from 'react';
import {
  Sparkles, ChevronRight, Camera, Video, Link2, Clapperboard,
  Loader2, CheckCircle2, X, TrendingUp, Search,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import { CATEGORIES, TONE_OPTIONS, type PlanningInput, type Category } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { DEMO_PLANNING_AUTOFILL } from '../../services/mock.service';
import {
  analyzeReference, mockAnalyzeReference, MAX_REFERENCE_VIDEO_BYTES,
} from '../../services/reference.service';

// ─── Reference video section ───────────────────────────────────────────────────

function ReferenceSection() {
  const { reference, setReference, settings } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState(reference.url ?? '');

  async function runAnalysis(source: { url?: string; videoDataUrl?: string; videoMimeType?: string; fileName?: string }) {
    setReference(prev => ({ ...prev, ...source, status: 'generating', errorMessage: undefined }));
    try {
      const analysis = settings.useMockMode || !settings.geminiApiKey
        ? await mockAnalyzeReference()
        : await analyzeReference(settings.geminiApiKey, source);
      setReference(prev => ({ ...prev, analysis, status: 'done' }));
    } catch (e) {
      setReference(prev => ({
        ...prev, status: 'error',
        errorMessage: e instanceof Error ? e.message : '레퍼런스 분석에 실패했습니다.',
      }));
    }
  }

  function handleUrlAnalyze() {
    const url = urlInput.trim();
    if (!url) return;
    runAnalysis({ url, videoDataUrl: undefined, videoMimeType: undefined, fileName: undefined });
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('video/')) return;
    if (file.size > MAX_REFERENCE_VIDEO_BYTES) {
      setReference(prev => ({
        ...prev, status: 'error',
        errorMessage: '영상이 너무 큽니다 (최대 15MB). 짧게 잘라 올리거나 링크를 사용해 주세요.',
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUrlInput('');
      runAnalysis({
        url: undefined,
        videoDataUrl: reader.result as string,
        videoMimeType: file.type,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  function clearReference() {
    setUrlInput('');
    setReference({ analysis: null, status: 'idle' });
  }

  const analyzing = reference.status === 'generating';

  return (
    <div className="wizard-card space-y-3 border-2 border-[var(--brand-primary)]/40">
      <div className="flex items-center justify-between">
        <label className="section-label flex items-center gap-1.5">
          <Clapperboard className="w-4 h-4 text-[var(--brand-primary)]" />
          레퍼런스 영상 (선택)
        </label>
        {(reference.url || reference.fileName || reference.analysis) && (
          <button onClick={clearReference}
            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> 초기화
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        따라 만들고 싶은 숏폼이 있다면 링크를 붙여넣거나 영상을 올려주세요.
        컨셉·색감·자막·BGM·효과음을 분석해 비슷한 분위기로 제작합니다.
      </p>

      {/* URL input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input-base pl-9" placeholder="YouTube Shorts 링크 붙여넣기"
            value={urlInput} onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleUrlAnalyze(); }}
            disabled={analyzing} />
        </div>
        <Button variant="secondary" size="sm" onClick={handleUrlAnalyze}
          disabled={!urlInput.trim() || analyzing}
          leftIcon={<Search className="w-3.5 h-3.5" />}>
          분석
        </Button>
      </div>

      {/* File upload */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={analyzing}
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand-text)] dark:text-[var(--brand-text-dark)] hover:underline disabled:opacity-50">
          <Video className="w-3.5 h-3.5" />
          또는 영상 파일 업로드 (최대 15MB)
        </button>
        {reference.fileName && (
          <span className="text-xs text-slate-500 truncate">— {reference.fileName}</span>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

      {/* Status */}
      {analyzing && (
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text-dark)] bg-[var(--brand-soft-bg)] dark:bg-[var(--brand-soft-bg-dark)] rounded-2xl px-3 py-2.5">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          AI가 레퍼런스 영상의 스타일을 분석하고 있습니다...
        </div>
      )}
      {reference.status === 'error' && (
        <Alert variant="error" onClose={() => setReference(prev => ({ ...prev, status: 'idle', errorMessage: undefined }))}>
          {reference.errorMessage}
        </Alert>
      )}
      {reference.status === 'done' && reference.analysis && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 space-y-1.5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> 스타일 분석 완료
          </p>
          <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">{reference.analysis.concept}</p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              자막: {reference.analysis.subtitle.position}/{reference.analysis.subtitle.size}
            </span>
            <span className="text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              BGM: {reference.analysis.bgm.slice(0, 20)}...
            </span>
            <span className="text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              템포: {reference.analysis.editingPace.slice(0, 18)}...
            </span>
          </div>
        </div>
      )}
      {reference.status === 'idle' && !reference.analysis && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          레퍼런스가 없으면 최신 숏폼 트렌드 스타일로 자동 구성됩니다
        </p>
      )}
    </div>
  );
}

export default function PlanningStep() {
  const { session, updatePlanning, setStep } = useApp();

  const initial: PlanningInput = session.planning ?? {
    identity: '', category: '일상/브이로그' as Category, topic: '',
    mainPoints: ['', '', ''] as [string, string, string],
    hasPhotos: false, hasVideos: false,
    bannedExpressions: '', tone: '',
  };

  const [form, setForm] = useState<PlanningInput>(initial);
  const [selectedTones, setSelectedTones] = useState<string[]>(() =>
    initial.tone ? initial.tone.split(', ').filter(Boolean) : [],
  );
  const [customTone, setCustomTone] = useState('');
  const [error, setError] = useState('');

  const set = <K extends keyof PlanningInput>(key: K, val: PlanningInput[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const setPoint = (i: number, val: string) => {
    const pts = [...form.mainPoints] as [string, string, string];
    pts[i] = val;
    set('mainPoints', pts);
  };

  const toggleTone = (t: string) =>
    setSelectedTones(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  function validate() {
    if (!form.identity.trim()) return '내 소개를 입력해주세요.';
    if (!form.topic.trim()) return '주제를 입력해주세요.';
    if (form.mainPoints.some(p => !p.trim())) return '주요 포인트 3개를 모두 입력해주세요.';
    if (selectedTones.length === 0 && !customTone.trim()) return '원하는 말투를 선택하거나 입력해주세요.';
    return '';
  }

  function handleNext() {
    const err = validate();
    if (err) { setError(err); return; }
    const tone = selectedTones.length > 0
      ? [...selectedTones, ...(customTone.trim() ? [customTone.trim()] : [])].join(', ')
      : customTone.trim();
    updatePlanning({ ...form, tone });
    setStep('ideas');
  }

  function autoFill() {
    setForm(DEMO_PLANNING_AUTOFILL);
    setSelectedTones(['친근한', '유쾌한']);
    setCustomTone('');
    setError('');
  }

  return (
    <div className="slide-up space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">기획 입력</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">영상 제작의 첫 단계입니다</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />} onClick={autoFill}>
          예시 자동 채우기
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Reference video (양쪽 모드 공통 — 맨 처음) */}
      <ReferenceSection />

      {/* Identity */}
      <div className="wizard-card space-y-2">
        <label className="section-label">내 소개 *</label>
        <p className="text-xs text-slate-500 dark:text-slate-400">나는 누구인가요?</p>
        <input className="input-base" placeholder="예: 1인 라이프스타일 유튜버, 음식 블로거, 피트니스 트레이너"
          value={form.identity} onChange={e => set('identity', e.target.value)} />
      </div>

      {/* Category */}
      <div className="wizard-card space-y-3">
        <label className="section-label">카테고리 *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => set('category', cat)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                form.category === cat
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
              )}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div className="wizard-card space-y-2">
        <label className="section-label">주제 *</label>
        <input className="input-base" placeholder="예: 새벽 5시 기상 3년째 직장인의 아침 루틴, 혼자서 만드는 간단 파스타 레시피"
          value={form.topic} onChange={e => set('topic', e.target.value)} />
      </div>

      {/* Main Points */}
      <div className="wizard-card space-y-3">
        <label className="section-label">주요 포인트 3개 *</label>
        <p className="text-xs text-slate-500 dark:text-slate-400">각 포인트를 한 줄로 요약해 주세요</p>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex gap-2 items-center">
            <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <input className="input-base"
              placeholder={['예: 핵심 습관 또는 비결 한 가지', '예: 따라 하기 쉬운 현실적인 방법', '예: 실제로 달라진 점 또는 결과'][i]}
              value={form.mainPoints[i]} onChange={e => setPoint(i, e.target.value)} />
          </div>
        ))}
      </div>

      {/* Media assets checkbox */}
      <div className="wizard-card space-y-3">
        <label className="section-label">보유 미디어 자산</label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          사용할 수 있는 사진이나 동영상이 있나요? 슬라이드 씬 단계에서 직접 업로드할 수 있습니다.
        </p>
        <div className="space-y-2">
          <label className={clsx(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            form.hasPhotos
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-blue-200',
          )}>
            <input type="checkbox" className="sr-only" checked={form.hasPhotos}
              onChange={e => set('hasPhotos', e.target.checked)} />
            <div className={clsx(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
              form.hasPhotos ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600',
            )}>
              {form.hasPhotos && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <Camera className={clsx('w-4 h-4 shrink-0', form.hasPhotos ? 'text-blue-600' : 'text-slate-400')} />
            <div>
              <p className={clsx('text-sm font-medium', form.hasPhotos ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300')}>
                사진이 있어요
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">슬라이드 씬에 직접 사진을 사용할 수 있습니다</p>
            </div>
          </label>

          <label className={clsx(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            form.hasVideos
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-purple-200',
          )}>
            <input type="checkbox" className="sr-only" checked={form.hasVideos}
              onChange={e => set('hasVideos', e.target.checked)} />
            <div className={clsx(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
              form.hasVideos ? 'bg-purple-600 border-purple-600' : 'border-slate-300 dark:border-slate-600',
            )}>
              {form.hasVideos && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <Video className={clsx('w-4 h-4 shrink-0', form.hasVideos ? 'text-purple-600' : 'text-slate-400')} />
            <div>
              <p className={clsx('text-sm font-medium', form.hasVideos ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300')}>
                동영상이 있어요
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">슬라이드 씬에 동영상 클립을 사용할 수 있습니다</p>
            </div>
          </label>
        </div>

        {(form.hasPhotos || form.hasVideos) && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            슬라이드 씬 단계에서 업로드 버튼이 활성화됩니다
          </p>
        )}
      </div>

      {/* Banned Expressions */}
      <div className="wizard-card space-y-2">
        <label className="section-label">꼭 피해야 할 표현</label>
        <textarea className="input-base resize-none" rows={3}
          placeholder="예: 과장된 전후 비교, 근거 없는 효과 주장, 특정 브랜드 언급"
          value={form.bannedExpressions} onChange={e => set('bannedExpressions', e.target.value)} />
      </div>

      {/* Tone */}
      <div className="wizard-card space-y-3">
        <div className="flex items-center justify-between">
          <label className="section-label">원하는 말투 *</label>
          {selectedTones.length > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{selectedTones.length}개 선택됨</span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">여러 개 중복 선택 가능합니다.</p>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(t => {
            const active = selectedTones.includes(t);
            return (
              <button key={t} onClick={() => { toggleTone(t); setCustomTone(''); }}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all flex items-center gap-1.5',
                  active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                )}>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                {t}
              </button>
            );
          })}
        </div>
        {selectedTones.length > 0 && (
          <p className="text-xs text-slate-500">선택: <span className="text-blue-600 dark:text-blue-400 font-medium">{selectedTones.join(', ')}</span></p>
        )}
        <input className="input-base" placeholder="직접 추가 (예: 희망적인, 열정적인)"
          value={customTone} onChange={e => setCustomTone(e.target.value)} />
      </div>

      <div className="flex justify-end pt-2">
        <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />} onClick={handleNext}>
          아이디어 생성하기
        </Button>
      </div>
    </div>
  );
}
