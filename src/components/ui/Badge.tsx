'use client';

import { HTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'sale' | 'success' | 'warning' | 'info' | 'dark' | 'soft';
type Size = 'xs' | 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rounded?: 'md' | 'lg' | 'full';
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-500 text-white',
  sale:    'bg-sale-500 text-white',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  info:    'bg-blue-500 text-white',
  dark:    'bg-gray-900 text-white',
  soft:    'bg-primary-50 text-primary-700',
};

const sizeClasses: Record<Size, string> = {
  xs: 'h-5 px-1.5 text-2xs gap-1',
  sm: 'h-6 px-2 text-xs gap-1',
  md: 'h-7 px-2.5 text-xs gap-1.5',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  rounded = 'md',
  leftIcon,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const radius = rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-md';
  return (
    <span
      className={[
        'inline-flex items-center justify-center font-bold tracking-tight whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        radius,
        className,
      ].join(' ')}
      {...props}
    >
      {leftIcon}
      {children}
    </span>
  );
}
