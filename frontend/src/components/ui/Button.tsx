'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-[#1c61e7] text-white hover:bg-[#1a56d0] active:bg-[#1648b0] focus:ring-[#1c61e7]',
      secondary:
        'bg-white text-[#1c61e7] border border-[#1c61e7] hover:bg-[#eff6ff] focus:ring-[#1c61e7]',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-600',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
      outline:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
