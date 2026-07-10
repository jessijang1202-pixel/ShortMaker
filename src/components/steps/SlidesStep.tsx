import { useRef, useState } from 'react';
import {
  ChevronRight, ChevronLeft, Image, RefreshCcw, Loader2,
  CheckCircle, AlertCircle, Edit2, Clock, Upload, X, Video,
} from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import type { SlideScene } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { buildSlideImagePrompt } from '../../prompts';
import { generateSlideImage } from '../../services/imagen.service';
import { mockGenerateSlideImage } from '../../services/mock.service';
import { TREND_DEFAULT_STYLE } from '../../services/reference.service';

function isVideoUrl(url: string) {
  return url.startsWith('data:video/') || url.startsWith('blob:') && url.includes('video');
}

export default function SlidesStep() {
  const { session, settings, updateSlideScene, setStep, reference } = useApp();
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const scenes = session.scriptSplit?.slide_scenes ?? [];
  const idea = session.selectedIdea;
  const hasUserMedia = session.planning?.hasPhotos || session.planning?.hasVideos;

  async function generateImage(scene: SlideScene) {
    updateSlideScene({ ...scene, imageStatus: 'generating', imageUrl: undefined });
    try {
      const prompt = buildSlideImagePrompt(scene, idea!, reference.analysis ?? TREND_DEFAULT_STYLE);
      const result = settings.useMockMode || !settings.geminiApiKey
        ? { imageUrl: await mockGenerateSlideImage(scene) }
        : await generateSlideImage(settings.geminiApiKey, prompt);
      updateSlideScene({ ...scene, imageStatus: 'done', imageUrl: result.imageUrl });
    } catch (e) {
      updateSlideScene({ ...scene, imageStatus: 'error' });
      setError(`씬 "${scene.scene_title}" 이미지 생성 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
    }
  }

  async function generateAllImages() {
    setError('');
    for (const scene of scenes) {
      if (scene.imageStatus !== 'done') await generateImage(scene);
    }
  }

  function handleFileUpload(scene: SlideScene, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      updateSlideScene({ ...scene, imageStatus: 'done', imageUrl: url });
    };
    reader.readAsDataURL(file);
  }

  function clearMedia(scene: SlideScene) {
    updateSlideScene({ ...scene, imageStatus: 'idle', imageUrl: undefined });
    const ref = fileRefs.current[scene.scene_id];
    if (ref) ref.value = '';
  }

  function startEdit(scene: SlideScene) {
    setEditingId(scene.scene_id);
    setEditTexts(t => ({ ...t, [scene.scene_id]: scene.on_screen_text }));
  }

  function saveEdit(scene: SlideScene) {
    updateSlideScene({ ...scene, on_screen_text: editTexts[scene.scene_id] ?? scene.on_screen_text });
    setEditingId(null);
  }

  const anyGenerating = scenes.some(s => s.imageStatus === 'generating');

  return (
    <div className="slide-up space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">영상 후반부</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {scenes.length}개 씬 · {scenes.reduce((s, sc) => s + sc.duration_seconds, 0)}초
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Image className="w-3.5 h-3.5" />}
          onClick={generateAllImages} loading={anyGenerating} disabled={anyGenerating}>
          전체 AI 생성
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {settings.useMockMode && (
        <Alert variant="info">
          데모 모드: SVG 플레이스홀더 이미지가 생성됩니다. 실제 이미지는 Gemini API 키 설정 후 생성하세요.
        </Alert>
      )}

      {/* Media source banner */}
      {hasUserMedia && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm">
          <div className="flex gap-1.5 mt-0.5 shrink-0">
            {session.planning?.hasPhotos && <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">사진 있음</span>}
            {session.planning?.hasVideos && <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">동영상 있음</span>}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            각 씬에서 <strong className="text-slate-800 dark:text-slate-200">내 미디어 업로드</strong> 버튼으로 직접 파일을 사용하거나, AI 이미지 생성을 선택하세요.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {scenes.map((scene, idx) => {
          const isVideo = scene.imageUrl ? scene.imageUrl.startsWith('data:video/') : false;
          return (
            <div key={scene.scene_id} className="wizard-card space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{scene.scene_title}</p>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{scene.duration_seconds}초</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={scene.imageStatus} />
              </div>

              {/* Main content: media preview + text */}
              <div className="flex gap-3">
                {/* Media preview */}
                <div className="shrink-0 w-24 aspect-[9/16] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800 relative">
                  {scene.imageStatus === 'generating' ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  ) : scene.imageUrl ? (
                    <>
                      {isVideo ? (
                        <video src={scene.imageUrl} className="w-full h-full object-cover" muted playsInline loop
                          onMouseOver={e => (e.target as HTMLVideoElement).play()}
                          onMouseOut={e => (e.target as HTMLVideoElement).pause()} />
                      ) : (
                        <img src={scene.imageUrl} alt={scene.scene_title} className="w-full h-full object-cover" />
                      )}
                      {/* Clear button */}
                      <button onClick={() => clearMedia(scene)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </>
                  ) : (
                    <Image className="w-6 h-6 text-slate-300" />
                  )}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-500">화면 텍스트</p>
                      <button onClick={() => editingId === scene.scene_id ? saveEdit(scene) : startEdit(scene)}
                        className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                        <Edit2 className="w-3 h-3" />
                        {editingId === scene.scene_id ? '저장' : '편집'}
                      </button>
                    </div>
                    {editingId === scene.scene_id ? (
                      <textarea className="input-base text-sm resize-none" rows={3}
                        value={editTexts[scene.scene_id] ?? scene.on_screen_text}
                        onChange={e => setEditTexts(t => ({ ...t, [scene.scene_id]: e.target.value }))} />
                    ) : (
                      <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium leading-relaxed">
                        {scene.on_screen_text}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-0.5">나레이션</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{scene.narration_text}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={clsx('pt-1', hasUserMedia ? 'flex flex-wrap gap-2' : 'flex items-center gap-2')}>
                {/* Hidden file input */}
                {hasUserMedia && (
                  <input
                    type="file"
                    accept={[
                      session.planning?.hasPhotos ? 'image/*' : '',
                      session.planning?.hasVideos ? 'video/*' : '',
                    ].filter(Boolean).join(',')}
                    className="hidden"
                    ref={el => { fileRefs.current[scene.scene_id] = el; }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(scene, file);
                      if (e.target) e.target.value = '';
                    }}
                  />
                )}

                {/* Upload button (only when user has media) */}
                {hasUserMedia && (
                  <Button variant="secondary" size="sm"
                    leftIcon={scene.imageUrl && (scene.imageUrl.startsWith('data:image/') || scene.imageUrl.startsWith('data:video/'))
                      ? <RefreshCcw className="w-3.5 h-3.5" />
                      : <Upload className="w-3.5 h-3.5" />}
                    onClick={() => fileRefs.current[scene.scene_id]?.click()}>
                    {scene.imageUrl && !scene.imageUrl.startsWith('data:image/png;base64,PHN2Zy') /* not SVG placeholder */
                      ? '다른 파일로 교체'
                      : session.planning?.hasPhotos && session.planning?.hasVideos
                        ? '내 사진/동영상 업로드'
                        : session.planning?.hasPhotos
                          ? '내 사진 업로드'
                          : '내 동영상 업로드'}
                  </Button>
                )}

                {/* AI generation button */}
                <Button variant={hasUserMedia ? 'ghost' : 'secondary'} size="sm"
                  leftIcon={scene.imageStatus === 'generating'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Image className="w-3.5 h-3.5" />}
                  onClick={() => generateImage(scene)}
                  disabled={scene.imageStatus === 'generating'}>
                  {scene.imageStatus === 'done' && scene.imageUrl ? 'AI 재생성' : 'AI 이미지 생성'}
                </Button>

                {/* Status indicators */}
                {scene.imageStatus === 'error' && (
                  <span className="text-xs text-red-500 flex items-center gap-1 ml-auto">
                    <AlertCircle className="w-3 h-3" />생성 실패
                  </span>
                )}
                {scene.imageStatus === 'done' && scene.imageUrl && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ml-auto">
                    {isVideo ? <Video className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {isVideo ? '동영상 사용 중' : '완료'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Alert variant="info">
        이미지를 생성하지 않아도 스토리보드로 진행할 수 있습니다.
      </Alert>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('veo-clip')}>이전</Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('storyboard')}>
          스토리보드 보기
        </Button>

      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SlideScene['imageStatus'] }) {
  if (status === 'idle') return <span className="text-xs text-slate-400">대기 중</span>;
  if (status === 'generating') return (
    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
      <Loader2 className="w-3 h-3 animate-spin" />생성 중
    </span>
  );
  if (status === 'done') return (
    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
      <CheckCircle className="w-3 h-3" />완료
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3" />오류
    </span>
  );
  return null;
}
