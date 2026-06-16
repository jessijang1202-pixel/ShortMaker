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
  primary:   'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm',
  secondary: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 border-transparent',
  ghost:     'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent',
  danger:    'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3 rounded-xl gap-2',
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
          'inline-flex items-center justify-center font-medium border transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
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
