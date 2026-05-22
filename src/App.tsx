import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './store/theme';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';

// Pages
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/Invoices/InvoiceList';
import BillsTracker from './pages/BillsTracker';
import Expenses from './pages/Expenses';
import CustomerList from './pages/Customers/CustomerList';
import SettingsLayout from './pages/Settings/SettingsLayout';
import Profile from './pages/Settings/Profile';
import Appearance from './pages/Settings/Appearance';

function Placeholder({ name }: { name: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{name}</h1>
      <p className="text-[var(--text-secondary)] mt-1">Coming soon</p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="invoices" element={<InvoiceList />} />
              <Route path="bills" element={<BillsTracker />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="settings" element={<SettingsLayout />}>
                <Route index element={<Profile />} />
                <Route path="columns"    element={<Placeholder name="Invoice Columns" />} />
                <Route path="gst"        element={<Placeholder name="GST Settings" />} />
                <Route path="categories" element={<Placeholder name="Expense Categories" />} />
                <Route path="appearance" element={<Appearance />} />
                <Route path="data"       element={<Placeholder name="Data & Backup" />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
