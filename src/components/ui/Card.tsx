import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default:  'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm',
  elevated: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md',
  outline:  'bg-transparent border-2 border-slate-200 dark:border-slate-700',
  flat:     'bg-slate-50 dark:bg-slate-800/50',
};

const paddingStyles = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-6',
};

export default function Card({
  variant = 'default', padding = 'md', className, children, ...rest
}: CardProps) {
  return (
    <div
      className={clsx('rounded-3xl', variantStyles[variant], paddingStyles[padding], className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('flex items-start justify-between gap-2 mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={clsx('font-semibold text-slate-900 dark:text-slate-100', className)}>
      {children}
    </h3>
  );
}
