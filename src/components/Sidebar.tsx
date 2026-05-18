import React from 'react';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard, ArrowUpDown, PieChart, Target,
  Settings, X, TrendingUp, Tag
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transaksi', icon: ArrowUpDown },
  { id: 'analytics', label: 'Analitik', icon: TrendingUp },
  { id: 'budget', label: 'Budget', icon: PieChart },
  { id: 'savings', label: 'Tabungan', icon: Target },
  { id: 'categories', label: 'Kategori', icon: Tag },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { activeTab, setActiveTab } = useStore();

  const handleNav = (id: string) => {
    setActiveTab(id);
    onClose?.();
  };

  return (
    <div
      className="flex flex-col h-full w-64 select-none"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
            style={{ background: 'var(--accent)' }}
          >
            💚
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">MoneyFlow</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--sidebar-text)' }}>Finance Tracker</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all hover:bg-white/10"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 mb-4 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-left ${
                isActive ? 'shadow-lg' : 'hover:bg-white/5'
              }`}
              style={
                isActive
                  ? {
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }
                  : {
                      color: 'var(--sidebar-text)',
                      border: '1px solid transparent',
                    }
              }
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? '' : 'group-hover:bg-white/10'
                }`}
                style={isActive ? { background: 'rgba(16, 185, 129, 0.2)' } : {}}
              >
                <Icon size={16} />
              </div>
              <span className="font-medium text-sm flex-1">{item.label}</span>
              {isActive && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4">
        <div
          className="p-4 rounded-2xl"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.12)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span>✨</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              Offline Mode
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--sidebar-text)' }}>
            Semua data tersimpan lokal di perangkat Anda secara aman.
          </p>
        </div>

        <div className="mt-4 px-2 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--sidebar-text)' }}>
            MoneyFlow v1.0.0
          </span>
          <span className="text-xs" style={{ color: 'var(--accent)' }}>
            ● Online
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
