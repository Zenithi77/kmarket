'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

type Size = 'sm' | 'md' | 'lg';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
  selectSize?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 text-sm',
  md: 'h-11 text-sm',
  lg: 'h-12 text-base',
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, selectSize = 'md', className = '', id, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-800">
            {label}
            {props.required && <span className="text-sale-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              'w-full appearance-none rounded-xl border bg-white pl-4 pr-10 outline-none transition-all duration-200',
              sizeClasses[selectSize],
              error
                ? 'border-sale-500 focus:border-sale-500 focus:ring-2 focus:ring-sale-100'
                : 'border-gray-200 hover:border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
              className,
            ].join(' ')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        {error && <p className="text-xs text-sale-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };

