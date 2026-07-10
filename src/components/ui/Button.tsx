import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-on)] border-transparent shadow-sm hover:shadow-md active:scale-[0.98]',
  secondary: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 border-transparent',
  ghost:     'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent',
  danger:    'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm',
  success:   'bg-[#8BE8AC] hover:bg-[#6FE097] text-[#14351F] border-transparent shadow-sm hover:shadow-md active:scale-[0.98]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-2xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-2xl gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary', size = 'md', loading = false,
    leftIcon, rightIcon, children, className, disabled, ...rest
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-bold border transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 dark:focus:ring-offset-slate-900',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...rest}
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
