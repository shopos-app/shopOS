import { NavLink, Outlet } from 'react-router-dom';
import { User, Columns, BadgeIndianRupee, Tag, Palette, Database } from 'lucide-react';
import { cn } from '../../utils/cn';

const tabs = [
  { to: '/settings',            label: 'Shop Profile',      icon: User              },
  { to: '/settings/columns',    label: 'Invoice Columns',   icon: Columns           },
  { to: '/settings/gst',        label: 'GST',               icon: BadgeIndianRupee  },
  { to: '/settings/categories', label: 'Expense Categories',icon: Tag               },
  { to: '/settings/appearance', label: 'Appearance',        icon: Palette           },
  { to: '/settings/data',       label: 'Data & Backup',     icon: Database          },
];

export default function SettingsLayout() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Settings</h1>
      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="w-48 shrink-0 space-y-0.5">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/settings'}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
                isActive
                  ? 'bg-[var(--primary-subtle)] text-[var(--primary-text)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
