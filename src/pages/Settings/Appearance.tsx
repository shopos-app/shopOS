import { useTheme } from '../../store/theme';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Theme } from '../../db/types';

const options: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Always use the light theme' },
  { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Always use the dark theme'  },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follow your device setting'  },
];

export default function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Appearance</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Choose how ShopOS looks on your screen.</p>

      <div className="space-y-2">
        {options.map(({ value, label, icon: Icon, desc }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-colors',
              theme === value
                ? 'border-[var(--primary)] bg-[var(--primary-subtle)]'
                : 'border-[var(--border)] hover:bg-[var(--bg-elevated)]'
            )}
          >
            <Icon className={cn('w-5 h-5', theme === value ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]')} />
            <div>
              <p className={cn('text-sm font-medium', theme === value ? 'text-[var(--primary-text)]' : 'text-[var(--text-primary)]')}>{label}</p>
              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
            </div>
            {theme === value && (
              <div className="ml-auto w-2 h-2 rounded-full bg-[var(--primary)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
