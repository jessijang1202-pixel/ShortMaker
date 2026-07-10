import { useEffect, useRef, useState } from 'react';
import {
  RefreshCcw, ChevronRight, ChevronLeft, Lightbulb, Users, Heart,
  Zap, Target, CheckCircle2, Video, ImageIcon, X, Upload,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import type { ContentIdea } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { generateIdeas } from '../../services/gemini.service';
import { mockGenerateIdeas } from '../../services/mock.service';

// ─── Media Upload section (simple mode only) ───────────────────────────────────

const MAX_PHOTOS = 5;

function MediaUploadSection() {
  const { preUploadedAssets, setPreUploadedAssets } = useApp();
  const videoRef   = useRef<HTMLInputElement>(null);
  const photoRef   = useRef<HTMLInputElement>(null);
  const [videoDrag, setVideoDrag] = useState(false);
  const [photoDrag, setPhotoDrag] = useState(false);

  function addVideo(file: File) {
    if (!file.type.startsWith('video/')) return;
    const url = URL.createObjectURL(file);
    setPreUploadedAssets({ ...preUploadedAssets, videoUrl: url });
  }

  function removeVideo() {
    if (preUploadedAssets.videoUrl) URL.revokeObjectURL(preUploadedAssets.videoUrl);
    setPreUploadedAssets({ ...preUploadedAssets, videoUrl: undefined });
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS - preUploadedAssets.photoUrls.length;
    const added = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, remaining)
      .map(f => URL.createObjectURL(f));
    setPreUploadedAssets({ ...preUploadedAssets, photoUrls: [...preUploadedAssets.photoUrls, ...added] });
  }

  function removePhoto(idx: number) {
    const urls = [...preUploadedAssets.photoUrls];
    URL.revokeObjectURL(urls[idx]);
    urls.splice(idx, 1);
    setPreUploadedAssets({ ...preUploadedAssets, photoUrls: urls });
  }

  const canAddPhotos = preUploadedAssets.photoUrls.length < MAX_PHOTOS;

  return (
    <div className="wizard-card border-dashed border-2 border-slate-200 dark:border-slate-700 space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">내 미디어 업로드 (선택사항)</p>
        <span className="ml-auto text-xs text-slate-400">보유한 영상·사진을 활용합니다</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* ── 동영상 ─────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <Video className="w-3.5 h-3.5" /> 동영상 (1개)
          </p>

          {preUploadedAssets.videoUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video
                src={preUploadedAssets.videoUrl}
                className="w-full h-full object-cover"
                muted playsInline
              />
              <button
                onClick={removeVideo}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setVideoDrag(true); }}
              onDragLeave={() => setVideoDrag(false)}
              onDrop={e => {
                e.preventDefault(); setVideoDrag(false);
                const f = e.dataTransfer.files[0];
                if (f) addVideo(f);
              }}
              className={clsx(
                'w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors text-slate-400',
                videoDrag
                  ? 'border-[#8489F2] bg-[#ECEDFD] dark:bg-[#8489F2]/15 text-[#5157D8]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50',
              )}
            >
              <Video className="w-7 h-7 opacity-50" />
              <span className="text-xs">클릭하거나 드래그</span>
              <span className="text-[10px] opacity-60">mp4 · mov · avi</span>
            </button>
          )}

          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) addVideo(f); e.target.value = ''; }}
          />
        </div>

        {/* ── 사진 ───────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> 사진 (최대 {MAX_PHOTOS}장)
          </p>

          <div className="grid grid-cols-3 gap-1.5">
            {preUploadedAssets.photoUrls.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {canAddPhotos && (
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setPhotoDrag(true); }}
                onDragLeave={() => setPhotoDrag(false)}
                onDrop={e => {
                  e.preventDefault(); setPhotoDrag(false);
                  addPhotos(e.dataTransfer.files);
                }}
                className={clsx(
                  'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors text-slate-400',
                  photoDrag
                    ? 'border-[#8489F2] bg-[#ECEDFD] dark:bg-[#8489F2]/15 text-[#5157D8]'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50',
                )}
              >
                <ImageIcon className="w-5 h-5 opacity-50" />
                <span className="text-[9px]">추가</span>
              </button>
            )}
          </div>

          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { addPhotos(e.target.files); e.target.value = ''; }}
          />

          {preUploadedAssets.photoUrls.length > 0 && (
            <p className="text-[10px] text-slate-400 mt-1.5">
              {preUploadedAssets.photoUrls.length}/{MAX_PHOTOS}장 — 슬라이드 씬에 순서대로 적용됩니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function IdeaStep() {
  const { session, settings, setIdeas, selectIdea, setStep, videoMode } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session.ideas.length && session.planning) doGenerate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                      <Users className="w-3.5 h-3.5 text-[#8489F2] shrink-0 mt-0.5" />
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

      {/* 간단 모드에서만 미디어 업로드 섹션 표시 */}
      {videoMode === 'simple' && <MediaUploadSection />}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('planning')}>이전</Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={handleNext} disabled={!session.selectedIdea}>
          {videoMode === 'simple' ? '자동 제작 시작' : '훅 생성하기'}
        </Button>
      </div>
    </div>
  );
}
