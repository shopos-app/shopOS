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

function ShopOSLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#E8A020" />
      {/* Abstract S — two arcs forming a flowing S mark */}
      <path
        d="M22 10C22 10 10 10 10 14C10 17 22 15 22 19C22 23 10 22 10 22"
        stroke="#1B3A2D"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Sidebar() {
  const { resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[var(--sidebar-bg)] h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <ShopOSLogo />
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
                ? 'bg-[var(--sidebar-active)] text-[#1B3A2D] font-semibold shadow-sm'
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
              ? 'bg-[var(--sidebar-active)] text-[#1B3A2D] font-semibold'
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
