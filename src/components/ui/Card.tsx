import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm dark:shadow-none p-5',
        onClick && 'cursor-pointer hover:border-[var(--border-strong)] transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
}
