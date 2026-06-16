import clsx from 'clsx';

type BadgeVariant = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  blue:    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  green:   'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  yellow:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  red:     'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  purple:  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  orange:  'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantStyles[variant],
      className,
    )}>
      {children}
    </span>
  );
}
