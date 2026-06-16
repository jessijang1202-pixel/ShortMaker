import clsx from 'clsx';
import type { StoryboardSegment } from '../../types';

interface Props {
  segments: StoryboardSegment[];
  activeId: string | null;
  currentTime: number;   // seconds
  totalDuration: number;
  onSelect: (id: string) => void;
}

export default function StoryboardTimeline({ segments, activeId, currentTime, totalDuration, onSelect }: Props) {
  const pct = (s: number) => totalDuration > 0 ? `${(s / totalDuration) * 100}%` : '0%';

  return (
    <div className="space-y-2">
      {/* Playhead bar */}
      <div className="relative h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-blue-400/40 dark:bg-blue-600/40 transition-all duration-300"
          style={{ width: pct(currentTime) }}
        />
        {/* Segments */}
        {segments.map(seg => (
          <div
            key={seg.id}
            className={clsx(
              'absolute top-0 h-full transition-opacity',
              seg.type === 'veo' ? 'bg-blue-500' : 'bg-amber-400 dark:bg-amber-500',
              seg.id === activeId ? 'opacity-100' : 'opacity-40',
            )}
            style={{
              left: pct(seg.startTime),
              width: pct(seg.endTime - seg.startTime),
            }}
          />
        ))}
        {/* Playhead needle */}
        {totalDuration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-slate-900 shadow transition-all duration-300"
            style={{ left: pct(currentTime) }}
          />
        )}
      </div>

      {/* Segment labels */}
      <div className="flex gap-1">
        {segments.map(seg => (
          <button
            key={seg.id}
            onClick={() => onSelect(seg.id)}
            style={{ flexBasis: pct(seg.endTime - seg.startTime), flexGrow: 0, flexShrink: 0 }}
            className={clsx(
              'rounded-lg px-2 py-1.5 text-xs font-medium text-left truncate transition-all border-2',
              seg.type === 'veo'
                ? seg.id === activeId
                  ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                  : 'bg-blue-50 dark:bg-blue-950/30 border-transparent text-blue-600 dark:text-blue-400 hover:border-blue-300'
                : seg.id === activeId
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-transparent text-amber-600 dark:text-amber-400 hover:border-amber-300',
            )}
          >
            <span className="block truncate">{seg.label}</span>
            <span className="opacity-60">{seg.endTime - seg.startTime}s</span>
          </button>
        ))}
      </div>

      {/* Time markers */}
      <div className="relative h-4">
        {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => {
          if (i % 5 !== 0) return null;
          return (
            <span
              key={i}
              className="absolute text-[10px] text-slate-400 -translate-x-1/2"
              style={{ left: pct(i) }}
            >
              {i}s
            </span>
          );
        })}
      </div>
    </div>
  );
}
