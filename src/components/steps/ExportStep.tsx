import { useState } from 'react';
import { ChevronLeft, Download, FileJson, FileText, Video, Image, Copy, Check, RefreshCcw } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 200);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  if (dataUrl.startsWith('blob:')) {
    triggerDownload(dataUrl, filename);
    return;
  }
  // data: URI → convert to Blob for reliable large-file downloads
  try {
    const [header, b64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    downloadBlob(new Blob([arr], { type: mime }), filename);
  } catch {
    triggerDownload(dataUrl, filename);
  }
}

function downloadText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename);
}

function downloadJson(obj: unknown, filename: string) {
  downloadBlob(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }), filename);
}

interface CopyBtnProps { text: string; label: string }
function CopyBtn({ text, label }: CopyBtnProps) {
  const [copied, setCopied] = useState(false);
  async function handle() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handle}
      className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? '복사됨' : label}
    </button>
  );
}

export default function ExportStep() {
  const { session, resetSession, setStep } = useApp();
  const { planning, selectedIdea, selectedHook, scriptSplit, uploadCopy } = session;

  const fullScript = scriptSplit?.full_script ?? '';
  const veoClip = scriptSplit?.veo_core_clip;
  const slides = scriptSplit?.slide_scenes ?? [];

  const captionText = [
    uploadCopy?.titles[0]?.text ?? '',
    '',
    ...(uploadCopy?.platformVersions[0]
      ? [uploadCopy.platformVersions[0].caption, '', uploadCopy.platformVersions[0].hashtags.join(' ')]
      : []),
  ].join('\n');

  const summaryText = [
    '=== SnapReel — 최종 산출물 ===',
    '',
    '[ 기획 ]',
    `작성자: ${planning?.identity}`,
    `카테고리: ${planning?.category}`,
    `주제: ${planning?.topic}`,
    `말투: ${planning?.tone}`,
    '',
    '[ 아이디어 ]',
    selectedIdea?.idea_title ?? '',
    selectedIdea?.one_line_synopsis ?? '',
    '',
    '[ 훅 ]',
    `"${selectedHook?.text}" (${selectedHook?.style})`,
    '',
    '[ 전체 대본 ]',
    fullScript,
    '',
    '[ Veo 클립 프롬프트 ]',
    veoClip?.prompt ?? '',
    '',
    '[ 슬라이드 씬 ]',
    ...slides.map((sc, i) => [
      `씬 ${i + 1}: ${sc.scene_title} (${sc.duration_seconds}s)`,
      `화면: ${sc.on_screen_text}`,
      `나레이션: ${sc.narration_text}`,
    ].join('\n')),
    '',
    '[ 업로드 카피 ]',
    ...(uploadCopy?.titles.map(t => `[${t.style}] ${t.text}`) ?? []),
    '',
    uploadCopy?.hashtags.join(' ') ?? '',
  ].join('\n');

  const storyboardJson = scriptSplit ? {
    total_duration: (veoClip?.duration ?? 0) + slides.reduce((s, sc) => s + sc.duration_seconds, 0),
    veo_core_clip: {
      duration: veoClip?.duration,
      text: veoClip?.text,
      prompt: veoClip?.prompt,
    },
    slide_scenes: slides.map(sc => ({
      scene_id: sc.scene_id,
      scene_title: sc.scene_title,
      on_screen_text: sc.on_screen_text,
      narration_text: sc.narration_text,
      duration_seconds: sc.duration_seconds,
    })),
  } : {};

  return (
    <div className="slide-up space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">내보내기</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          모든 제작 결과물을 다운로드하거나 복사하세요
        </p>
      </div>

      <Alert variant="success" title="제작 완성!">
        30초 숏츠 구성이 완료되었습니다. 아래에서 원하는 형식으로 내보내세요.
      </Alert>

      {/* Hero video download */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-5 space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">숏츠 영상 다운로드</h3>
            <p className="text-sm text-blue-100 mt-0.5">
              {veoClip?.videoUrl
                ? '초반부 영상이 준비되었습니다'
                : '초반부 영상을 먼저 생성하거나 업로드하세요'}
            </p>
          </div>
        </div>

        {veoClip?.videoUrl ? (
          <button
            onClick={() => downloadDataUrl(veoClip.videoUrl!, '숏츠_영상.mp4')}
            className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base hover:bg-blue-50 active:scale-[0.98] transition-all shadow-md"
          >
            <Download className="w-5 h-5" />
            숏츠 영상 다운로드
          </button>
        ) : (
          <div className="w-full bg-white/20 text-white/60 font-medium py-4 rounded-2xl flex items-center justify-center gap-2 text-sm cursor-not-allowed select-none">
            <Download className="w-5 h-5" />
            영상 없음 — 초반부 영상 단계로 돌아가세요
          </div>
        )}

        <p className="text-xs text-blue-200 leading-relaxed">
          후반부 슬라이드 이미지는 아래 '슬라이드 이미지' 섹션에서 개별 저장하세요
        </p>
      </div>

      {/* Summary */}
      <div className="wizard-card border-2 border-emerald-200 dark:border-emerald-800 space-y-3">
        <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">기획 요약</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div><span className="text-slate-500">작성자:</span> <span className="text-slate-800 dark:text-slate-200">{planning?.identity}</span></div>
          <div><span className="text-slate-500">카테고리:</span> <span className="text-slate-800 dark:text-slate-200">{planning?.category}</span></div>
          <div className="sm:col-span-2"><span className="text-slate-500">주제:</span> <span className="text-slate-800 dark:text-slate-200">{planning?.topic}</span></div>
          <div><span className="text-slate-500">말투:</span> <span className="text-slate-800 dark:text-slate-200">{planning?.tone}</span></div>
          <div><span className="text-slate-500">아이디어:</span> <span className="text-slate-800 dark:text-slate-200">{selectedIdea?.idea_title}</span></div>
          <div className="sm:col-span-2"><span className="text-slate-500">훅:</span> <span className="text-slate-800 dark:text-slate-200 font-medium">"{selectedHook?.text}"</span></div>
        </div>
      </div>

      {/* Export options */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">내보내기 옵션</h3>

        {/* Full script */}
        <div className="wizard-card flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">전체 대본</p>
              <p className="text-xs text-slate-500 mt-0.5">대본 + 구조 분석 텍스트</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <CopyBtn text={fullScript} label="복사" />
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => downloadText(fullScript, '대본.txt')}>
              다운로드
            </Button>
          </div>
        </div>

        {/* Veo prompt */}
        {veoClip && (
          <div className="wizard-card flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Veo 생성 프롬프트</p>
                <p className="text-xs text-slate-500 mt-0.5">Veo 3.1 Lite용 영문 프롬프트</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <CopyBtn text={veoClip.prompt} label="복사" />
              {veoClip.videoUrl && (
                <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => downloadDataUrl(veoClip.videoUrl!, 'veo_clip.mp4')}>
                  영상 저장
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Slide images */}
        {slides.some(s => s.imageUrl) && (
          <div className="wizard-card space-y-3">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-amber-500" />
              <p className="font-medium text-slate-900 dark:text-white text-sm">슬라이드 이미지 ({slides.filter(s => s.imageUrl).length}개)</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slides.filter(s => s.imageUrl).map((scene, idx) => (
                <div key={scene.scene_id} className="space-y-1">
                  <div className="rounded-xl overflow-hidden aspect-[9/16] bg-slate-100 dark:bg-slate-800 cursor-pointer"
                    onClick={() => downloadDataUrl(scene.imageUrl!, `slide_${idx + 1}_${scene.scene_title}.jpg`)}>
                    <img src={scene.imageUrl!} alt={scene.scene_title} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </div>
                  <p className="text-xs text-slate-500 text-center truncate">{scene.scene_title}</p>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => slides.filter(s => s.imageUrl).forEach((s, i) => downloadDataUrl(s.imageUrl!, `slide_${i + 1}.jpg`))}>
              전체 이미지 저장
            </Button>
          </div>
        )}

        {/* Storyboard JSON */}
        <div className="wizard-card flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <FileJson className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">스토리보드 JSON</p>
              <p className="text-xs text-slate-500 mt-0.5">타임라인 구조 데이터</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => downloadJson(storyboardJson, 'storyboard.json')}>
            다운로드
          </Button>
        </div>

        {/* Full summary */}
        <div className="wizard-card flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">전체 산출물 요약</p>
              <p className="text-xs text-slate-500 mt-0.5">기획부터 카피까지 모두 포함</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <CopyBtn text={summaryText} label="복사" />
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => downloadText(summaryText, '숏츠_제작_산출물.txt')}>
              저장
            </Button>
          </div>
        </div>

        {/* Upload captions */}
        {uploadCopy && (
          <div className="wizard-card flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">업로드 카피 (YouTube)</p>
                <p className="text-xs text-slate-500 mt-0.5">제목 + 캡션 + 해시태그</p>
              </div>
            </div>
            <CopyBtn text={captionText} label="복사" />
          </div>
        )}
      </div>

      {/* Flow stub notice */}
      <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-4 text-center space-y-1">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Google Flow 내보내기</p>
        <p className="text-xs text-slate-400">향후 업데이트에서 Flow 직접 내보내기를 지원할 예정입니다.</p>
        <span className="inline-block text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full">준비 중</span>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('upload-copy')}>이전</Button>
        <Button variant="secondary" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={resetSession}>
          새로운 영상 제작
        </Button>
      </div>
    </div>
  );
}
