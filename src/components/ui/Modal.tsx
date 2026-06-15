'use client';

import { Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnBackdrop?: boolean;
  showClose?: boolean;
}

const sizeClasses = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  full: 'max-w-[95vw]',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showClose = true,
}: ModalProps) {
  // ESC to close + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          className={`pointer-events-auto bg-white rounded-2xl shadow-popover w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-scale-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showClose) && (
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
              <div className="min-w-0">
                {title && <h2 id="modal-title" className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>}
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  aria-label="Хаах"
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors kring"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          )}

          <div className="overflow-y-auto px-6 py-5 flex-1">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
}

