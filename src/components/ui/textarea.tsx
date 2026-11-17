import * as React from 'react';
import { cn } from '@/src/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border border-[#E5E0D5] bg-white px-3.5 py-2.5 text-sm text-[#1A2421] placeholder:text-[#7B8682] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533C]/30 focus-visible:border-[#14533C] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
