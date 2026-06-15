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
        'rounded-2xl bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] transition-all duration-[220ms]',
        onClick && 'cursor-pointer hover:shadow-[var(--shadow-md)]',
        className
      )}
    >
      {children}
    </div>
  );
}
