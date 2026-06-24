import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { generateHooks, generateScriptSplit } from '../../services/gemini.service';
import { mockGenerateHooks, mockGenerateScriptSplit } from '../../services/mock.service';
import type { SubtitleNarrationSettings } from '../../types';

const DEFAULT_NARRATION: SubtitleNarrationSettings = {
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

type TaskStatus = 'pending' | 'running' | 'done';

const TASKS = [
  { id: 'hooks',    label: '훅 라인 선택',       desc: 'AI가 시청자를 사로잡는 오프닝 문장을 선택합니다' },
  { id: 'script',   label: '대본 분리',           desc: '30초 타임라인으로 스크립트를 구성합니다' },
  { id: 'veo',      label: 'Veo 클립 프롬프트',   desc: '도입부 AI 영상 씬 프롬프트를 생성합니다' },
  { id: 'slides',   label: '슬라이드 씬 구성',    desc: '이미지+텍스트 슬라이드를 배치합니다' },
  { id: 'narration',label: '자막/나레이션 설정',   desc: '목소리와 자막 설정을 자동 적용합니다' },
];

const pause = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

interface Props {
  onError: (msg: string) => void;
}

export default function SimpleAutoProcess({ onError }: Props) {
  const {
    session, settings,
    setHooks, selectHook, setScriptSplit, updateVeoClip, updateSlideScene,
    setSubtitleNarration, setStep, preUploadedAssets,
  } = useApp();

  const [statuses, setStatuses] = useState<TaskStatus[]>(TASKS.map(() => 'pending'));
  const [doneAll, setDoneAll]   = useState(false);
  const ran = useRef(false);

  // snapshot session values at mount — they are set by step 1 & 2
  const planning    = useRef(session.planning);
  const selectedIdea = useRef(session.selectedIdea);

  function mark(idx: number, status: TaskStatus) {
    setStatuses(prev => prev.map((s, i) => (i === idx ? status : s)));
  }

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        if (!planning.current || !selectedIdea.current) {
          throw new Error('기획 또는 아이디어가 선택되지 않았습니다.');
        }

        // ── Step 3: 훅 선택 ──────────────────────────────────────────────
        mark(0, 'running');
        const hooks = settings.useMockMode || !settings.geminiApiKey
          ? await mockGenerateHooks()
          : await generateHooks(settings.geminiApiKey, planning.current, selectedIdea.current);
        setHooks(hooks);
        if (hooks.length > 0) selectHook(hooks[0]);
        mark(0, 'done');
        await pause(400);

        // ── Step 4: 대본 분리 ─────────────────────────────────────────────
        mark(1, 'running');
        const hookToUse = hooks[0];
        const split = settings.useMockMode || !settings.geminiApiKey
          ? await mockGenerateScriptSplit()
          : await generateScriptSplit(
              settings.geminiApiKey, planning.current, selectedIdea.current, hookToUse,
            );
        setScriptSplit(split);
        mark(1, 'done');
        await pause(400);

        // ── Step 5: Veo 클립 — 업로드 영상 있으면 적용 ───────────────────
        mark(2, 'running');
        await pause(600);
        if (preUploadedAssets.videoUrl) {
          updateVeoClip({
            ...split.veo_core_clip,
            videoUrl: preUploadedAssets.videoUrl,
            status: 'done',
          });
        }
        mark(2, 'done');
        await pause(400);

        // ── Step 6: 슬라이드 — 업로드 사진 있으면 순서대로 적용 ──────────
        mark(3, 'running');
        await pause(500);
        preUploadedAssets.photoUrls.forEach((photoUrl, i) => {
          const scene = split.slide_scenes[i];
          if (scene) updateSlideScene({ ...scene, imageUrl: photoUrl, imageStatus: 'done' });
        });
        mark(3, 'done');
        await pause(400);

        // ── Step 7: 자막/나레이션 기본값 적용 ────────────────────────────
        mark(4, 'running');
        await pause(400);
        setSubtitleNarration(DEFAULT_NARRATION);
        mark(4, 'done');
        await pause(700);

        setDoneAll(true);
        await pause(900);
        setStep('storyboard');
      } catch (e) {
        onError(e instanceof Error ? e.message : '자동 제작 중 오류가 발생했습니다.');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doneCount = statuses.filter(s => s === 'done').length;
  const progress  = Math.round((doneCount / TASKS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-6 pt-6 pb-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">AI가 자동 제작 중</h2>
              <p className="text-sm text-violet-200">기획 정보를 바탕으로 나머지 과정을 처리합니다</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-1.5 mt-2">
            <div
              className="bg-white h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-violet-200 mt-1">{progress}%</p>
        </div>

        {/* Task list */}
        <div className="px-6 py-5 space-y-4">
          {TASKS.map((task, idx) => {
            const status = statuses[idx];
            return (
              <div
                key={task.id}
                className={`flex items-start gap-3 transition-all duration-500 ${
                  status === 'pending' ? 'opacity-30' : 'opacity-100'
                }`}
              >
                <div className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center">
                  {status === 'done' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  {status === 'running' && (
                    <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                  )}
                  {status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${
                    status === 'done'    ? 'text-emerald-600 dark:text-emerald-400 line-through' :
                    status === 'running' ? 'text-violet-700 dark:text-violet-300' :
                                          'text-slate-400 dark:text-slate-500'
                  }`}>
                    {task.label}
                  </p>
                  {status === 'running' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {task.desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {doneAll && (
          <div className="px-6 pb-6 text-center animate-pulse">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              모든 작업 완료! 스토리보드로 이동합니다...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
