'use client';

import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  width?: string | number;
  height?: string | number;
}

const radiusMap = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({
  rounded = 'md',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`kskeleton ${radiusMap[rounded]} ${className}`}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Skeleton rounded="sm" className="aspect-square w-full !rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton height={10} className="w-1/3" />
        <Skeleton height={14} className="w-full" />
        <Skeleton height={14} className="w-4/5" />
        <Skeleton height={18} className="w-1/2 mt-2" />
      </div>
    </div>
  );
}
