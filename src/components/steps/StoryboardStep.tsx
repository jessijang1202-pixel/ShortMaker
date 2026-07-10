import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Video, Image } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type { StoryboardSegment } from '../../types';
import Button from '../ui/Button';
import StoryboardTimeline from '../storyboard/StoryboardTimeline';
import { subtitlePositionClass, subtitleSizeClass, subtitleStyleProps } from '../../utils/subtitleStyle';

function buildSegments(scriptSplit: NonNullable<ReturnType<typeof useApp>['session']['scriptSplit']>): StoryboardSegment[] {
  const segs: StoryboardSegment[] = [];
  let t = 0;

  const veo = scriptSplit.veo_core_clip;
  segs.push({
    id: 'veo_core',
    type: 'veo',
    label: '초반부 영상',
    startTime: t,
    endTime: t + veo.duration,
    videoUrl: veo.videoUrl,
    on_screen_text: veo.text,
    narration: veo.text,
    textPosition: veo.textPosition,
    textSize: veo.textSize,
  });
  t += veo.duration;

  for (const scene of scriptSplit.slide_scenes) {
    segs.push({
      id: scene.scene_id,
      type: 'slide',
      label: scene.scene_title,
      startTime: t,
      endTime: t + scene.duration_seconds,
      imageUrl: scene.imageUrl,
      on_screen_text: scene.on_screen_text,
      narration: scene.narration_text,
    });
    t += scene.duration_seconds;
  }

  return segs;
}

export default function StoryboardStep() {
  const { session, setStep } = useApp();
  const split = session.scriptSplit;
  const segments = split ? buildSegments(split) : [];
  const totalDuration = segments.length > 0 ? segments[segments.length - 1].endTime : 0;

  // 자막 스타일: 레퍼런스 분석(또는 사용자 설정)을 전 구간에 동일하게 적용.
  // veo 클립은 개별 위치/크기 지정이 있으면 그것을 우선한다 (고급 모드에서 수동 조정한 경우).
  const narration = session.subtitleNarration;
  const subtitleEnabled = narration?.subtitleEnabled ?? true;
  const subtitleStyle = subtitleStyleProps(narration?.subtitleStyle);

  const [activeId, setActiveId] = useState<string | null>(segments[0]?.id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeSeg = segments.find(s => s.id === activeId) ?? null;

  // Sync video play/pause via ref (autoPlay prop is not reactive)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) v.play().catch(() => {});
    else v.pause();
  }, [isPlaying, activeId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = +(prev + 0.1).toFixed(1);
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          const seg = segments.find(s => s.startTime <= next && s.endTime > next);
          if (seg) setActiveId(seg.id);
          return next;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, totalDuration]);

  function handleSelect(id: string) {
    const seg = segments.find(s => s.id === id);
    if (!seg) return;
    setActiveId(id);
    setCurrentTime(seg.startTime);
    setIsPlaying(false);
  }

  function handleReset() {
    setIsPlaying(false);
    setCurrentTime(0);
    if (segments.length) setActiveId(segments[0].id);
  }

  function togglePlay() {
    if (currentTime >= totalDuration) { handleReset(); return; }
    setIsPlaying(p => !p);
  }

  if (!split) return null;

  return (
    <div className="slide-up space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">30초 스토리보드</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {segments.length}개 구간 · 총 {totalDuration}초
        </p>
      </div>

      {/* Phone frame preview */}
      <div className="flex justify-center">
        <div className="relative w-48 rounded-3xl border-4 border-slate-800 dark:border-slate-600 bg-black overflow-hidden shadow-2xl"
          style={{ aspectRatio: '9/16' }}>
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-black/60 flex items-center justify-center z-10">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full" />
          </div>

          {/* Content area */}
          {activeSeg ? (
            <>
              {(() => {
                // 레퍼런스 스타일(또는 사용자 설정)의 위치·크기를 전 구간에 적용.
                // veo 클립에 수동 지정된 값이 있으면(고급 모드) 그것을 우선한다.
                const posClass = subtitlePositionClass(activeSeg.textPosition ?? narration?.subtitlePosition);
                const sizeClass = subtitleSizeClass(activeSeg.textSize ?? narration?.subtitleSize);
                const caption = subtitleEnabled && activeSeg.on_screen_text ? (
                  <div className={`absolute left-0 right-0 px-3 pointer-events-none ${posClass}`}>
                    <p
                      className={`text-white text-center leading-snug whitespace-pre-line ${sizeClass}`}
                      style={subtitleStyle}
                    >
                      {activeSeg.on_screen_text}
                    </p>
                  </div>
                ) : null;

                if (activeSeg.type === 'veo') {
                  return activeSeg.videoUrl ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        key={activeSeg.id}
                        src={activeSeg.videoUrl}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        preload="auto"
                      />
                      {caption}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-blue-950 relative">
                      <Video className="w-10 h-10 text-blue-400 mb-3" />
                      <p className="text-xs text-blue-300 text-center px-3">초반부 영상 ({split.veo_core_clip.duration}초)</p>
                      {caption}
                    </div>
                  );
                }

                return activeSeg.imageUrl ? (
                  <div className="w-full h-full relative">
                    <img src={activeSeg.imageUrl} alt={activeSeg.label} className="w-full h-full object-cover" />
                    {caption}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-900 to-amber-950 relative">
                    <Image className="w-8 h-8 text-amber-400 mb-3" />
                    {caption}
                  </div>
                );
              })()}

              {/* Segment type badge */}
              <div className={`absolute top-8 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold z-10
                ${activeSeg.type === 'veo'
                  ? 'bg-blue-600/80 text-white'
                  : 'bg-amber-500/80 text-white'
                }`}>
                {activeSeg.type === 'veo' ? '초반부' : `후반부 ${segments.filter(s => s.type === 'slide').findIndex(s => s.id === activeSeg.id) + 1}`}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <p className="text-slate-500 text-xs">세그먼트 없음</p>
            </div>
          )}

          {/* Time overlay */}
          <div className="absolute bottom-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white font-mono z-10">
            {currentTime.toFixed(1)}s / {totalDuration}s
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={handleReset}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <button onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors">
          {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
        </button>
        <div className="w-9 h-9" />
      </div>

      {/* Timeline */}
      <div className="wizard-card">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">타임라인</h3>
        <StoryboardTimeline
          segments={segments}
          activeId={activeId}
          currentTime={currentTime}
          totalDuration={totalDuration}
          onSelect={handleSelect}
        />
      </div>

      {/* Active segment info */}
      {activeSeg && (
        <div className={`rounded-xl px-4 py-3 text-sm border-2 ${
          activeSeg.type === 'veo'
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
        }`}>
          <p className={`font-semibold mb-1 ${activeSeg.type === 'veo' ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {activeSeg.label} ({activeSeg.endTime - activeSeg.startTime}초)
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">{activeSeg.narration}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>초반부 영상</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-400" />
          <span>후반부 씬</span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('slides')}>이전</Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('upload-copy')}>업로드 카피 생성</Button>
      </div>
    </div>
  );
}
