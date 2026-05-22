import { NavLink } from 'react-router-dom';
import { LayoutGrid, FileText, CreditCard, Receipt, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/',          icon: LayoutGrid, label: 'Home'     },
  { to: '/invoices',  icon: FileText,   label: 'Invoices' },
  { to: '/bills',     icon: CreditCard, label: 'Bills'    },
  { to: '/expenses',  icon: Receipt,    label: 'Expenses' },
  { to: '/settings',  icon: Settings,   label: 'Settings' },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--sidebar-bg)] border-t border-white/10 px-2 pb-safe">
      <div className="flex justify-around">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors min-w-0',
              isActive ? 'text-[var(--sidebar-active)]' : 'text-slate-500'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
