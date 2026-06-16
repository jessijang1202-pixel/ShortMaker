import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export default function LoadingSpinner({ size = 'md', label, className }: LoadingSpinnerProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={clsx('animate-spin text-blue-500', sizeMap[size])} />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
}

export function LoadingOverlay({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
      {label && (
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300 font-medium">{label}</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">잠시만 기다려주세요...</p>
        </div>
      )}
    </div>
  );
}
