import clsx from 'clsx';

type BadgeVariant = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  blue:    'bg-[#ECEDFD] dark:bg-[#8489F2]/20 text-[#5157D8] dark:text-[#B4B7F8]',
  green:   'bg-[#DBF7E5] dark:bg-[#8BE8AC]/15 text-[#1E9950] dark:text-[#8BE8AC]',
  yellow:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  red:     'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  purple:  'bg-[#ECEDFD] dark:bg-[#8489F2]/20 text-[#5157D8] dark:text-[#B4B7F8]',
  orange:  'bg-[#FDEBD7] dark:bg-[#F79A4D]/20 text-[#B0621E] dark:text-[#F79A4D]',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold',
      variantStyles[variant],
      className,
    )}>
      {children}
    </span>
  );
}
