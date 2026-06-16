import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import clsx from 'clsx';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label = '복사', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200',
        copied
          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600',
        className,
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? '복사됨!' : label}
    </button>
  );
}
