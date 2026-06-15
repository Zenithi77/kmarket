'use client';

import { TextareaHTMLAttributes, forwardRef, useState } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCount, className = '', id, onChange, defaultValue, value, maxLength, ...props }, ref) => {
    const textareaId = id || props.name;
    const [count, setCount] = useState(
      typeof value === 'string' ? value.length :
      typeof defaultValue === 'string' ? defaultValue.length : 0
    );

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-800">
            {label}
            {props.required && <span className="text-sale-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            onChange={(e) => { setCount(e.target.value.length); onChange?.(e); }}
            className={[
              'w-full rounded-xl border bg-white px-4 py-3 outline-none transition-all duration-200 resize-y min-h-[96px]',
              'placeholder:text-gray-400 text-sm',
              error
                ? 'border-sale-500 focus:border-sale-500 focus:ring-2 focus:ring-sale-100'
                : 'border-gray-200 hover:border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
              className,
            ].join(' ')}
            {...props}
          />
          {showCount && maxLength && (
            <span className="absolute bottom-2 right-3 text-2xs text-gray-400 tabular">
              {count}/{maxLength}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-sale-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };

