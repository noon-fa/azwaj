import * as React from 'react';
import { cn } from '@/src/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3.5 py-2 text-sm text-[#1A2421] placeholder:text-[#7B8682] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533C]/30 focus-visible:border-[#14533C] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
