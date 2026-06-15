'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section';
  hover?: boolean;
  padded?: boolean;
  flat?: boolean;
  children: ReactNode;
}

export function Card({
  as: Tag = 'div',
  hover = false,
  padded = false,
  flat = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={[
        'bg-white rounded-2xl border border-gray-100',
        flat ? '' : 'shadow-soft',
        hover ? 'transition-all duration-300 hover:shadow-cardHover hover:-translate-y-0.5' : '',
        padded ? 'p-5 md:p-6' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 md:px-6 pt-5 md:pt-6 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 md:px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 md:px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl ${className}`} {...props}>
      {children}
    </div>
  );
}
