import { useEffect, useState } from 'react';
import { RefreshCcw, ChevronRight, ChevronLeft, Lightbulb, Users, Heart, Zap, Target, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import type { ContentIdea } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { generateIdeas } from '../../services/gemini.service';
import { mockGenerateIdeas } from '../../services/mock.service';

export default function IdeaStep() {
  const { session, settings, setIdeas, selectIdea, setStep } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session.ideas.length && session.planning) doGenerate();
  }, []);

  async function doGenerate() {
    if (!session.planning) return;
    setLoading(true); setError('');
    try {
      const ideas = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateIdeas()
        : await generateIdeas(settings.geminiApiKey, session.planning);
      setIdeas(ideas);
    } catch (e) {
      setError(`아이디어 생성에 실패했습니다. ${e instanceof Error ? e.message : ''}`);
    } finally { setLoading(false); }
  }

  function handleNext() {
    if (!session.selectedIdea) { setError('아이디어를 선택해주세요.'); return; }
    setStep('hooks');
  }

  if (loading) return <LoadingOverlay label="AI가 아이디어를 생성하고 있습니다..." />;

  return (
    <div className="slide-up space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">아이디어 선택</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">3가지 콘텐츠 방향 중 하나를 선택하세요</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={doGenerate} loading={loading}>
          다시 생성
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {session.planning && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm">
          <span className="font-semibold text-blue-700 dark:text-blue-300">기획 요약:</span>
          <span className="text-blue-600 dark:text-blue-400 ml-2">
            [{session.planning.category}] {session.planning.topic} — {session.planning.tone} 말투
          </span>
        </div>
      )}

      <div className="grid gap-4">
        {session.ideas.map((idea: ContentIdea, idx) => {
          const isSelected = session.selectedIdea?.id === idea.id;
          return (
            <div key={idea.id} onClick={() => selectIdea(idea)}
              className={clsx('selectable-card cursor-pointer', isSelected && 'selected')}>
              <div className="flex items-start gap-3">
                <span className={clsx(
                  'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all',
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                )}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">{idea.idea_title}</h3>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-3">"{idea.one_line_synopsis}"</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-start gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">핵심 앵글</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{idea.main_angle}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">타겟 대상</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{idea.target_audience}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">감성 앵글</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{idea.emotional_angle}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">공감 이유</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{idea.why_it_resonates}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {session.ideas.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>아이디어를 생성해주세요.</p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('planning')}>이전</Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={handleNext} disabled={!session.selectedIdea}>훅 생성하기</Button>
      </div>
    </div>
  );
}
