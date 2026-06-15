import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const base = [
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
  'transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:opacity-45 disabled:cursor-not-allowed',
  'active:scale-[0.97]',
].join(' ');

const variants: Record<Variant, string> = {
  primary:   'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)]',
  secondary: 'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]',
  ghost:     'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
  danger:    'bg-[var(--danger)] text-white hover:brightness-110 focus-visible:ring-[var(--danger)]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
