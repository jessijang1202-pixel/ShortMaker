import { useEffect, useState } from 'react';
import { RefreshCcw, ChevronRight, ChevronLeft, Zap, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { generateHooks } from '../../services/gemini.service';
import { mockGenerateHooks } from '../../services/mock.service';
import { TREND_DEFAULT_STYLE } from '../../services/reference.service';

export default function HookStep() {
  const { session, settings, setHooks, selectHook, setStep, reference } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session.hooks.length && session.planning && session.selectedIdea) doGenerate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function doGenerate() {
    if (!session.planning || !session.selectedIdea) return;
    setLoading(true); setError('');
    try {
      const hooks = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateHooks()
        : await generateHooks(
            settings.geminiApiKey, session.planning, session.selectedIdea,
            reference.analysis ?? TREND_DEFAULT_STYLE,
          );
      setHooks(hooks);
    } catch (e) {
      setError(`훅 생성에 실패했습니다. ${e instanceof Error ? e.message : ''}`);
    } finally { setLoading(false); }
  }

  function handleNext() {
    if (!session.selectedHook) { setError('훅 라인을 선택해주세요.'); return; }
    setStep('script-split');
  }

  if (loading) return <LoadingOverlay label="AI가 훅 라인을 생성하고 있습니다..." />;

  return (
    <div className="slide-up space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">훅 선택</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">첫 3초를 사로잡을 오프닝 훅을 선택하세요</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={doGenerate}>
          다시 생성
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {session.selectedIdea && (
        <div className="bg-[var(--brand-soft-bg)] dark:bg-[var(--brand-soft-bg-dark)] border-2 border-[var(--brand-primary)]/30 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-[var(--brand-text)] dark:text-[var(--brand-text-dark)] mb-0.5">선택된 아이디어</p>
          <p className="text-sm font-semibold text-[var(--brand-text)] dark:text-slate-100">{session.selectedIdea.idea_title}</p>
        </div>
      )}

      <Alert variant="info">
        훅은 영상의 첫 3초에 나오는 오프닝 문장입니다. 시청자가 스크롤을 멈추게 만드는 가장 중요한 요소입니다.
      </Alert>

      <div className="grid gap-4">
        {session.hooks.map((hook, idx) => {
          const isSelected = session.selectedHook?.id === hook.id;
          return (
            <div key={hook.id} onClick={() => selectHook(hook)}
              className={clsx('selectable-card cursor-pointer', isSelected && 'selected')}>
              <div className="flex items-center gap-3">
                <span className={clsx(
                  'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold',
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500',
                )}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={isSelected ? 'blue' : 'default'}>{hook.style}</Badge>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white leading-snug">"{hook.text}"</p>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>

      {session.hooks.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>훅을 생성해주세요.</p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('ideas')}>이전</Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={handleNext} disabled={!session.selectedHook}>대본 생성하기</Button>
      </div>
    </div>
  );
}
