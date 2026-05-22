import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, FileText, CreditCard, Receipt, Users, Settings, Sun, Moon,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../store/theme';

const navItems = [
  { to: '/',          icon: LayoutGrid,  label: 'Dashboard'  },
  { to: '/invoices',  icon: FileText,    label: 'Invoices'   },
  { to: '/bills',     icon: CreditCard,  label: 'Bills'      },
  { to: '/expenses',  icon: Receipt,     label: 'Expenses'   },
  { to: '/customers', icon: Users,       label: 'Customers'  },
];

export function Sidebar() {
  const { resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[var(--sidebar-bg)] h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-[var(--sidebar-active)] flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">ShopOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--sidebar-active)] text-white shadow-sm'
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <button
          onClick={cycleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          {resolvedTheme === 'dark'
            ? <><Sun className="w-5 h-5" /> Light mode</>
            : <><Moon className="w-5 h-5" /> Dark mode</>
          }
        </button>
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-[var(--sidebar-active)] text-white'
              : 'text-slate-400 hover:bg-white/10 hover:text-white'
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
