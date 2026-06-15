'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

type Variant = 'default' | 'primary' | 'soft' | 'danger' | 'ghost' | 'glass';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  rounded?: 'lg' | 'xl' | 'full';
  icon: ReactNode;
  label: string;
  badge?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-primary-600',
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-brand',
  soft:    'bg-primary-50 text-primary-700 hover:bg-primary-100',
  danger:  'bg-sale-500 text-white hover:bg-sale-600',
  ghost:   'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-primary-600',
  glass:   'bg-white/80 backdrop-blur text-gray-700 hover:bg-white hover:text-primary-600 border border-white/60 shadow-soft',
};

const sizeClasses: Record<Size, string> = {
  xs: 'w-7 h-7 [&_svg]:w-3.5 [&_svg]:h-3.5',
  sm: 'w-9 h-9 [&_svg]:w-4 [&_svg]:h-4',
  md: 'w-10 h-10 [&_svg]:w-5 [&_svg]:h-5',
  lg: 'w-12 h-12 [&_svg]:w-6 [&_svg]:h-6',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  variant = 'default',
  size = 'md',
  rounded = 'xl',
  icon,
  label,
  badge,
  className = '',
  ...props
}, ref) => {
  const radius = rounded === 'full' ? 'rounded-full' : rounded === 'xl' ? 'rounded-xl' : 'rounded-lg';
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={[
        'relative inline-flex items-center justify-center transition-all duration-200',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed kring',
        variantClasses[variant],
        sizeClasses[size],
        radius,
        className,
      ].join(' ')}
      {...props}
    >
      {icon}
      {badge != null && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-sale-500 text-white text-2xs font-bold rounded-full flex items-center justify-center ring-2 ring-white tabular">
          {badge}
        </span>
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';
