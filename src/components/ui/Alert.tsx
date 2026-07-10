import clsx from 'clsx';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const styles: Record<AlertVariant, { wrapper: string; icon: React.ElementType; iconClass: string }> = {
  info:    { wrapper: 'bg-[#ECEDFD] dark:bg-[#8489F2]/10 border-[#C7C9FA] dark:border-[#8489F2]/40 text-[#3D42B0] dark:text-[#B4B7F8]', icon: Info,          iconClass: 'text-[#8489F2]' },
  success: { wrapper: 'bg-[#DBF7E5] dark:bg-[#8BE8AC]/10 border-[#A8EDC1] dark:border-[#8BE8AC]/40 text-[#14351F] dark:text-[#8BE8AC]', icon: CheckCircle,   iconClass: 'text-[#1E9950]' },
  warning: { wrapper: 'bg-[#FDEBD7] dark:bg-[#F79A4D]/10 border-[#FBD3A5] dark:border-[#F79A4D]/40 text-[#7A3D0E] dark:text-[#F79A4D]', icon: AlertTriangle, iconClass: 'text-[#F79A4D]' },
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
    <div className={clsx('flex gap-3 p-4 rounded-2xl border-2 text-sm', wrapper, className)}>
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
