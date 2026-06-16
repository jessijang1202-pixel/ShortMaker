import { useEffect, useRef, useState } from 'react';
import { RefreshCcw, ChevronRight, ChevronLeft, FileText, Video, Image, Clock, Upload, X, CheckCircle, Pencil, Check } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { generateScriptSplit } from '../../services/gemini.service';
import { mockGenerateScriptSplit } from '../../services/mock.service';

export default function ScriptSplitStep() {
  const { session, settings, setScriptSplit, updateVeoClip, setStep } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingScript, setEditingScript] = useState(false);
  const [draftScript, setDraftScript] = useState('');
  const videoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session.scriptSplit && session.planning && session.selectedIdea && session.selectedHook) {
      doGenerate();
    }
  }, []);

  async function doGenerate() {
    if (!session.planning || !session.selectedIdea || !session.selectedHook) return;
    setLoading(true); setError('');
    try {
      const split = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateScriptSplit()
        : await generateScriptSplit(settings.geminiApiKey, session.planning, session.selectedIdea, session.selectedHook);
      setScriptSplit(split);
    } catch (e) {
      setError(`대본 생성에 실패했습니다. ${e instanceof Error ? e.message : ''}`);
    } finally { setLoading(false); }
  }

  function handleVideoUpload(file: File) {
    const clip = session.scriptSplit?.veo_core_clip;
    if (!clip) return;
    const url = URL.createObjectURL(file);
    updateVeoClip({ ...clip, videoUrl: url, status: 'done' });
    if (videoFileRef.current) videoFileRef.current.value = '';
  }

  function clearVideo() {
    const clip = session.scriptSplit?.veo_core_clip;
    if (!clip) return;
    updateVeoClip({ ...clip, videoUrl: undefined, status: 'idle' });
  }

  if (loading) return <LoadingOverlay label="AI가 대본과 구성을 분리하고 있습니다..." />;

  const split = session.scriptSplit;
  const veoClip = split?.veo_core_clip;
  const hasUploadedVideo = !!veoClip?.videoUrl;

  return (
    <div className="slide-up space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">대본 + 구성 분리</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            전체 대본을 영상 핵심 초반부 + 영상 후반부로 분리합니다
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={doGenerate}>
          다시 생성
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {!split && !loading && (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>대본을 생성해주세요.</p>
        </div>
      )}

      {split && (
        <>
          {/* Full Script */}
          <div className="wizard-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">전체 대본 (~30초)</h3>
              </div>
              {!editingScript ? (
                <button
                  type="button"
                  onClick={() => { setDraftScript(split.full_script); setEditingScript(true); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  title="대본 편집"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setScriptSplit({ ...split, full_script: draftScript }); setEditingScript(false); }}
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    title="저장"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingScript(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="취소"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            {editingScript ? (
              <textarea
                value={draftScript}
                onChange={e => setDraftScript(e.target.value)}
                rows={8}
                className="w-full text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-blue-300 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                {split.full_script}
              </pre>
            )}
          </div>

          {/* Structure */}
          <div className="wizard-card space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">4단계 구조 분석</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'problem', label: '문제 제기', color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' },
                { key: 'empathy', label: '공감 형성', color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' },
                { key: 'solution', label: '해결 / 관점', color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' },
                { key: 'action', label: '행동 촉구', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
              ].map(({ key, label, color }) => (
                <div key={key} className={`rounded-xl border px-3 py-2.5 ${color}`}>
                  <p className="text-xs font-bold mb-1 opacity-70">{label}</p>
                  <p className="text-sm">{split.structure[key as keyof typeof split.structure]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 영상 핵심 초반부 (formerly Veo Core Clip) */}
          <div className="wizard-card space-y-3 border-2 border-blue-200 dark:border-blue-800">
            {/* Hidden video file input */}
            <input
              ref={videoFileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">영상 핵심 초반부</h3>
                  <p className="text-xs text-slate-500">직접 업로드 또는 AI 생성 (8–10초)</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">{split.veo_core_clip.duration}s</span>
              </div>
            </div>

            {/* Uploaded video preview with hook script overlay */}
            {hasUploadedVideo && veoClip && (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-64 mx-auto max-w-[145px]">
                <video
                  src={veoClip.videoUrl}
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Script overlay */}
                <div className="absolute bottom-5 left-0 right-0 px-2 pointer-events-none">
                  <p
                    className="text-white text-center text-[9px] font-semibold leading-snug whitespace-pre-line"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)' }}
                  >
                    {veoClip.text}
                  </p>
                </div>
                <button
                  onClick={clearVideo}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}

            {/* Upload / status row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={hasUploadedVideo ? 'secondary' : 'primary'}
                size="sm"
                leftIcon={hasUploadedVideo ? <RefreshCcw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                onClick={() => videoFileRef.current?.click()}
              >
                {hasUploadedVideo ? '다른 영상으로 교체' : '동영상 직접 업로드'}
              </Button>
              {hasUploadedVideo && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  업로드된 영상 사용 — 다음 단계에서 Veo 생성 불필요
                </span>
              )}
              {!hasUploadedVideo && (
                <span className="text-xs text-slate-500">
                  영상 없으면 다음 단계에서 Veo AI로 생성합니다
                </span>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">나레이션 텍스트 (한국어)</p>
                <p className="text-sm text-slate-800 dark:text-slate-200 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2">
                  {split.veo_core_clip.text}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Veo 생성 프롬프트 (영문)</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 leading-relaxed">
                  {split.veo_core_clip.prompt}
                </p>
              </div>
            </div>
          </div>

          {/* 영상 후반부 (formerly Slide Scenes) */}
          <div className="wizard-card space-y-3">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                영상 후반부 ({split.slide_scenes.length}개 씬 · {split.slide_scenes.reduce((s, sc) => s + sc.duration_seconds, 0)}초)
              </h3>
            </div>
            <div className="space-y-3">
              {split.slide_scenes.map((scene, idx) => (
                <div key={scene.scene_id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{scene.scene_title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{scene.duration_seconds}s</span>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="font-medium text-slate-500 mb-0.5">화면 텍스트</p>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{scene.on_screen_text}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500 mb-0.5">나레이션</p>
                      <p className="text-slate-600 dark:text-slate-400">{scene.narration_text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline summary */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Video className="w-4 h-4" />
              <span className="font-semibold">{split.veo_core_clip.duration}s</span>
              <span className="text-slate-500">초반부</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">+</span>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Image className="w-4 h-4" />
              <span className="font-semibold">{split.slide_scenes.reduce((s, sc) => s + sc.duration_seconds, 0)}s</span>
              <span className="text-slate-500">후반부 {split.slide_scenes.length}개 씬</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">=</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Clock className="w-4 h-4" />
              <span>{split.veo_core_clip.duration + split.slide_scenes.reduce((s, sc) => s + sc.duration_seconds, 0)}s 총합</span>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('hooks')}>이전</Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('veo-clip')} disabled={!split}>
          초반부 영상으로
        </Button>
      </div>
    </div>
  );
}
