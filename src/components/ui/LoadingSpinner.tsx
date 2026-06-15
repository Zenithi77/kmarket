'use client';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'primary' | 'white' | 'dark';
}

const sizeClasses = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
  xl: 'w-14 h-14 border-4',
};

const variantClasses = {
  primary: 'border-primary-100 border-t-primary-500',
  white:   'border-white/40 border-t-white',
  dark:    'border-gray-300 border-t-gray-800',
};

export function LoadingSpinner({ size = 'md', className = '', variant = 'primary' }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Уншиж байна"
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    />
  );
}

