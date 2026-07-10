import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { generateHooks, generateScriptSplit } from '../../services/gemini.service';
import { mockGenerateHooks, mockGenerateScriptSplit, mockGenerateSlideImage } from '../../services/mock.service';
import { generateVeoClip } from '../../services/veo.service';
import { generateSlideImage } from '../../services/imagen.service';
import { buildSlideImagePrompt } from '../../prompts';
import {
  analyzeReference, mockAnalyzeReference, TREND_DEFAULT_STYLE,
} from '../../services/reference.service';
import type { ReferenceStyle, SubtitleNarrationSettings } from '../../types';

function buildNarrationDefaults(style: ReferenceStyle): SubtitleNarrationSettings {
  return {
    subtitleEnabled: true,
    subtitlePosition: style.subtitle.position,
    subtitleSize: style.subtitle.size,
    subtitleStyle: style.subtitle.style,
    narrationEnabled: true,
    narrationGender: 'female',
    narrationMood: '친근한',
    narrationSpeed: 1.0,
    soundEffectsEnabled: true,
  };
}

type TaskStatus = 'pending' | 'running' | 'done' | 'warn';

const TASKS = [
  { id: 'style',    label: '스타일 분석',          desc: '레퍼런스 영상의 컨셉·색감·자막·BGM을 분석합니다' },
  { id: 'hooks',    label: '훅 라인 선택',          desc: 'AI가 시청자를 사로잡는 오프닝 문장을 선택합니다' },
  { id: 'script',   label: '대본 구성 (20초)',      desc: 'Veo 8초 + 슬라이드 12초 타임라인으로 구성합니다' },
  { id: 'veo',      label: 'AI 영상 생성 (8초)',    desc: 'Veo로 도입부 영상을 생성합니다' },
  { id: 'slides',   label: '슬라이드 구성 (12초)',  desc: '업로드 미디어와 AI 이미지로 장면을 채웁니다' },
  { id: 'narration',label: '자막/나레이션 설정',     desc: '레퍼런스 스타일에 맞춰 자막과 목소리를 설정합니다' },
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
    reference, setReference,
  } = useApp();

  const [statuses, setStatuses] = useState<TaskStatus[]>(TASKS.map(() => 'pending'));
  const [dynamicDesc, setDynamicDesc] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [doneAll, setDoneAll]   = useState(false);
  const ran = useRef(false);

  // snapshot session values at mount — they are set by step 1 & 2
  const planning     = useRef(session.planning);
  const selectedIdea = useRef(session.selectedIdea);
  const refState     = useRef(reference);

  function mark(idx: number, status: TaskStatus) {
    setStatuses(prev => prev.map((s, i) => (i === idx ? status : s)));
    if (status !== 'running') setDynamicDesc('');
  }

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const isMock = settings.useMockMode || !settings.geminiApiKey;
    const apiKey = settings.geminiApiKey;
    const warns: string[] = [];

    (async () => {
      try {
        if (!planning.current || !selectedIdea.current) {
          throw new Error('기획 또는 아이디어가 선택되지 않았습니다.');
        }

        // ── 0: 스타일 분석 (레퍼런스 or 트렌드 기본값) ────────────────────
        mark(0, 'running');
        let style: ReferenceStyle;
        const ref = refState.current;
        if (ref.analysis) {
          style = ref.analysis;
          await pause(600);
        } else if (ref.url || ref.videoDataUrl) {
          try {
            style = isMock
              ? await mockAnalyzeReference()
              : await analyzeReference(apiKey, ref);
            setReference(prev => ({ ...prev, analysis: style, status: 'done' }));
          } catch {
            style = TREND_DEFAULT_STYLE;
            warns.push('레퍼런스 분석에 실패해 트렌드 스타일로 대체했습니다.');
          }
        } else {
          setDynamicDesc('레퍼런스가 없어 최신 숏폼 트렌드 스타일을 적용합니다');
          style = TREND_DEFAULT_STYLE;
          await pause(900);
        }
        mark(0, 'done');
        await pause(300);

        // ── 1: 훅 선택 ──────────────────────────────────────────────────
        mark(1, 'running');
        const hooks = isMock
          ? await mockGenerateHooks()
          : await generateHooks(apiKey, planning.current, selectedIdea.current, style);
        setHooks(hooks);
        if (hooks.length > 0) selectHook(hooks[0]);
        mark(1, 'done');
        await pause(300);

        // ── 2: 대본 분리 (8초 Veo + 12초 슬라이드) ───────────────────────
        mark(2, 'running');
        const split = isMock
          ? await mockGenerateScriptSplit()
          : await generateScriptSplit(
              apiKey, planning.current, selectedIdea.current, hooks[0], style,
            );
        setScriptSplit(split);
        mark(2, 'done');
        await pause(300);

        // ── 3: Veo 8초 영상 — 업로드 영상 우선, 없으면 AI 생성 ───────────
        mark(3, 'running');
        if (preUploadedAssets.videoUrl) {
          setDynamicDesc('업로드한 영상을 도입부에 적용합니다');
          await pause(700);
          updateVeoClip({
            ...split.veo_core_clip,
            videoUrl: preUploadedAssets.videoUrl,
            status: 'done',
          });
        } else if (!isMock) {
          try {
            const veoPrompt = `${split.veo_core_clip.prompt}\n\nStyle guide (match closely): ${style.promptGuide}`;
            const result = await generateVeoClip(
              apiKey,
              { prompt: veoPrompt, durationSeconds: 8, aspectRatio: '9:16' },
              msg => setDynamicDesc(msg),
            );
            updateVeoClip({
              ...split.veo_core_clip,
              prompt: veoPrompt,
              videoUrl: result.videoUrl,
              duration: 8,
              status: 'done',
            });
          } catch (e) {
            warns.push(`AI 영상 생성 실패 — 스토리보드에서 다시 시도할 수 있습니다. (${e instanceof Error ? e.message : ''})`);
            updateVeoClip({ ...split.veo_core_clip, status: 'error' });
          }
        } else {
          setDynamicDesc('데모 모드 — 영상 생성을 건너뜁니다 (API 키 필요)');
          await pause(1000);
        }
        mark(3, 'done');
        await pause(300);

        // ── 4: 슬라이드 12초 — 업로드 사진 → 부족분 AI 이미지 ────────────
        mark(4, 'running');
        const scenes = split.slide_scenes;
        let photoIdx = 0;
        for (let i = 0; i < scenes.length; i++) {
          const scene = scenes[i];
          const photo = preUploadedAssets.photoUrls[photoIdx];
          if (photo) {
            setDynamicDesc(`업로드한 사진을 장면 ${i + 1}에 적용합니다 (${i + 1}/${scenes.length})`);
            updateSlideScene({ ...scene, imageUrl: photo, imageStatus: 'done' });
            photoIdx++;
            await pause(350);
          } else {
            setDynamicDesc(`AI 이미지 생성 중 (${i + 1}/${scenes.length}) — ${scene.scene_title}`);
            try {
              const imageUrl = isMock
                ? await mockGenerateSlideImage(scene)
                : (await generateSlideImage(apiKey, buildSlideImagePrompt(scene, selectedIdea.current!, style))).imageUrl;
              updateSlideScene({ ...scene, imageUrl, imageStatus: 'done' });
            } catch {
              warns.push(`장면 ${i + 1} 이미지 생성 실패 — 스토리보드에서 다시 생성할 수 있습니다.`);
              updateSlideScene({ ...scene, imageStatus: 'error' });
            }
          }
        }
        mark(4, 'done');
        await pause(300);

        // ── 5: 자막/나레이션 — 레퍼런스 스타일 반영 ──────────────────────
        mark(5, 'running');
        setDynamicDesc(`자막: ${style.subtitle.description}`);
        await pause(800);
        setSubtitleNarration(buildNarrationDefaults(style));
        mark(5, 'done');

        setWarnings(warns);
        setDoneAll(true);
        await pause(warns.length ? 2200 : 900);
        setStep('storyboard');
      } catch (e) {
        onError(e instanceof Error ? e.message : '자동 제작 중 오류가 발생했습니다.');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doneCount = statuses.filter(s => s === 'done' || s === 'warn').length;
  const progress  = Math.round((doneCount / TASKS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="bg-[#241E3C] px-6 pt-6 pb-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#8BE8AC] rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#14351F]" />
            </div>
            <div>
              <h2 className="font-black text-lg leading-tight">AI가 자동 제작 중</h2>
              <p className="text-sm text-slate-300">레퍼런스 스타일에 맞춰 20초 숏폼을 만듭니다</p>
            </div>
          </div>
          <div className="bg-white/15 rounded-full h-1.5 mt-2">
            <div
              className="bg-[#8BE8AC] h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-slate-300 mt-1">{progress}%</p>
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
                    <CheckCircle2 className="w-5 h-5 text-[#1E9950]" />
                  )}
                  {status === 'warn' && (
                    <AlertTriangle className="w-5 h-5 text-[#F79A4D]" />
                  )}
                  {status === 'running' && (
                    <Loader2 className="w-5 h-5 text-[#8489F2] animate-spin" />
                  )}
                  {status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold leading-tight ${
                    status === 'done'    ? 'text-[#1E9950] dark:text-[#8BE8AC] line-through' :
                    status === 'running' ? 'text-[#5157D8] dark:text-[#B4B7F8]' :
                                          'text-slate-400 dark:text-slate-500'
                  }`}>
                    {task.label}
                  </p>
                  {status === 'running' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {dynamicDesc || task.desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {doneAll && (
          <div className="px-6 pb-6 space-y-2">
            {warnings.map((w, i) => (
              <p key={i} className="flex items-start gap-1.5 text-xs text-[#B0621E] dark:text-[#F79A4D]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {w}
              </p>
            ))}
            <p className="text-center text-sm font-bold text-[#1E9950] dark:text-[#8BE8AC] animate-pulse">
              모든 작업 완료! 스토리보드로 이동합니다...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
