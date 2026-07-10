import type { TextPosition, TextSize, SubtitleStyle } from '../types';

export function subtitlePositionClass(pos: TextPosition = 'bottom'): string {
  if (pos === 'top') return 'top-4';
  if (pos === 'center') return 'top-1/2 -translate-y-1/2';
  return 'bottom-4';
}

export function subtitleSizeClass(size: TextSize = 'medium'): string {
  if (size === 'large') return 'text-base';
  if (size === 'small') return 'text-[10px]';
  return 'text-xs';
}

export function subtitleStyleProps(style: SubtitleStyle = 'outline'): React.CSSProperties {
  if (style === 'outline')
    return { fontWeight: 700, textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' };
  if (style === 'shadow')
    return { fontWeight: 700, textShadow: '2px 2px 6px rgba(0,0,0,0.9)' };
  if (style === 'bold')
    return { fontWeight: 900, textShadow: '0 1px 3px rgba(0,0,0,0.8)' };
  return { fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.6)' };
}
