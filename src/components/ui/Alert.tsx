import clsx from 'clsx';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const styles: Record<AlertVariant, { wrapper: string; icon: React.ElementType; iconClass: string }> = {
  info:    { wrapper: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',    icon: Info,          iconClass: 'text-blue-500' },
  success: { wrapper: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200', icon: CheckCircle,   iconClass: 'text-emerald-500' },
  warning: { wrapper: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',   icon: AlertTriangle, iconClass: 'text-amber-500' },
  error:   { wrapper: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',       icon: XCircle,       iconClass: 'text-red-500' },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const { wrapper, icon: Icon, iconClass } = styles[variant];
  return (
    <div className={clsx('flex gap-3 p-4 rounded-xl border text-sm', wrapper, className)}>
      <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', iconClass)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
