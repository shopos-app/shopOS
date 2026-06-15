import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-lg border bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]',
            'placeholder:text-[var(--text-muted)]',
            'transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
            'disabled:opacity-45 disabled:cursor-not-allowed',
            error
              ? 'border-[var(--danger)] focus:ring-[var(--danger)]'
              : 'border-[var(--border)] hover:border-[var(--border-strong)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
