import React from 'react';
import { useStore } from '../store/useStore';
import { LayoutDashboard, ArrowUpDown, TrendingUp, PieChart, Target } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transaksi', icon: ArrowUpDown },
  { id: 'analytics', label: 'Analitik', icon: TrendingUp },
  { id: 'budget', label: 'Budget', icon: PieChart },
  { id: 'savings', label: 'Tabungan', icon: Target },
];

const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 mobile-nav-safe"
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all min-w-0"
              style={
                isActive
                  ? { color: 'var(--accent)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={
                  isActive
                    ? { background: 'var(--accent-light)', color: 'var(--accent)' }
                    : {}
                }
              >
                <Icon size={18} />
              </div>
              <span
                className="text-[10px] font-semibold truncate"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
