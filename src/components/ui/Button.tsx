'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'soft' | 'dark' | 'link';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rounded?: 'md' | 'lg' | 'xl' | 'full';
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-brand',
  secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400',
  outline:   'bg-transparent hover:bg-primary-50 text-primary-600 border-2 border-primary-500',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-700',
  danger:    'bg-sale-500 hover:bg-sale-600 text-white shadow-sale',
  soft:      'bg-primary-50 hover:bg-primary-100 text-primary-700',
  dark:      'bg-gray-900 hover:bg-black text-white',
  link:      'bg-transparent text-on-surface hover:text-black hover:underline underline-offset-4 px-0 py-0',
};

const sizeClasses: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  xl: 'h-14 px-8 text-base gap-2.5',
};

const roundedClasses = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  rounded = 'xl',
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const base =
    'inline-flex items-center justify-center transition-all duration-200 ' +
    'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ' +
    'kring select-none whitespace-nowrap';
  const ctaText = 'font-semibold tracking-tight';

  return (
    <button
      ref={ref}
      className={[
        base,
        variant === 'link' ? 'font-medium' : ctaText,
        variantClasses[variant],
        variant === 'link' ? '' : sizeClasses[size],
        variant === 'link' ? '' : roundedClasses[rounded],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-1.5" />}
      {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

