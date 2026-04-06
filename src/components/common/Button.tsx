import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'dark' | 'blue' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary-600 text-white',
    'hover:bg-primary-700 hover:shadow-md hover:shadow-primary-500/20',
    'active:bg-primary-800',
    'disabled:bg-primary-300 disabled:shadow-none',
  ].join(' '),
  secondary: [
    'bg-white text-surface-700 border border-surface-200',
    'hover:bg-surface-50 hover:border-surface-300 hover:text-surface-900',
    'active:bg-surface-100',
    'disabled:bg-surface-50 disabled:text-surface-400 disabled:border-surface-200',
  ].join(' '),
  danger: [
    'bg-white text-red-600 border border-red-200',
    'hover:bg-red-50 hover:border-red-300 hover:text-red-700',
    'active:bg-red-100',
    'disabled:text-red-300 disabled:border-red-100',
  ].join(' '),
  success: [
    'bg-green-600 text-white',
    'hover:bg-green-700 hover:shadow-md hover:shadow-green-500/20',
    'active:bg-green-800',
    'disabled:bg-green-300 disabled:shadow-none',
  ].join(' '),
  ghost: [
    'bg-surface-100 text-surface-700',
    'hover:bg-surface-200 hover:text-surface-900',
    'active:bg-surface-300',
    'disabled:bg-surface-50 disabled:text-surface-400',
  ].join(' '),
  dark: [
    'bg-surface-900 text-white',
    'hover:bg-surface-800 hover:shadow-md hover:shadow-surface-900/20',
    'active:bg-surface-950',
    'disabled:bg-surface-400 disabled:shadow-none',
  ].join(' '),
  blue: [
    'bg-blue-600 text-white',
    'hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20',
    'active:bg-blue-800',
    'disabled:bg-blue-300 disabled:shadow-none',
  ].join(' '),
  icon: [
    'text-surface-400',
    'hover:bg-surface-100 hover:text-surface-600',
    'active:bg-surface-200',
    'disabled:text-surface-300',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-sm gap-2',
  'icon-sm': 'p-1.5',
  'icon-md': 'p-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconRight, loading, children, className, disabled, ...props }, ref) => {
    const isIconOnly = variant === 'icon';
    const resolvedSize = isIconOnly ? (size === 'sm' || size === 'icon-sm' ? 'icon-sm' : 'icon-md') : size;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-lg',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2',
          'disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[resolvedSize],
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
