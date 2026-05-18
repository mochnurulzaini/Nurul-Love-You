import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { generateDemoData } from '../data/defaultData';
import {
  Moon, Sun, Monitor, Download, Upload, Trash2,
  ChevronRight, Shield, Palette, Database, RotateCcw,
  CheckCircle, X, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const {
    settings, updateSettings,
    exportData, importData, resetAllData,
    addTransaction, budgets, savingsGoals,
    transactions,
  } = useStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data berhasil diekspor! 📦');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const json = ev.target?.result as string;
        const success = importData(json);
        if (success) {
          toast.success('Data berhasil diimpor! ✅');
        } else {
          toast.error('File tidak valid');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    toast.success('Data telah direset', { icon: '🔄' });
  };

  const handleLoadDemo = () => {
    const { transactions: demoTxs, budgets: demoBudgets, savingsGoals: demoGoals } = generateDemoData();
    const { addBudget, addSavingsGoal } = useStore.getState();

    demoTxs.forEach((tx) => {
      const { id, createdAt, ...rest } = tx;
      addTransaction(rest);
    });
    demoBudgets.forEach((b) => {
      const { id, ...rest } = b;
      addBudget(rest);
    });
    demoGoals.forEach((g) => {
      const { id, createdAt, ...rest } = g;
      addSavingsGoal(rest);
    });
    toast.success('Demo data dimuat! 🎉');
  };

  const handleSavePin = () => {
    if (pinValue.length < 4) {
      toast.error('PIN minimal 4 digit');
      return;
    }
    if (pinValue !== pinConfirm) {
      toast.error('PIN tidak cocok');
      return;
    }
    updateSettings({ pin: pinValue, pinEnabled: true });
    setShowPinSetup(false);
    setPinValue('');
    setPinConfirm('');
    toast.success('PIN berhasil diatur 🔐');
  };

  const themeOptions = [
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'auto', label: 'Otomatis', icon: Monitor },
  ] as const;

  const accentColors = [
    { value: 'emerald', color: '#10b981', label: 'Emerald' },
    { value: 'blue', color: '#3b82f6', label: 'Blue' },
    { value: 'violet', color: '#8b5cf6', label: 'Violet' },
    { value: 'rose', color: '#f43f5e', label: 'Rose' },
    { value: 'amber', color: '#f59e0b', label: 'Amber' },
    { value: 'cyan', color: '#06b6d4', label: 'Cyan' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Pengaturan</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sesuaikan MoneyFlow sesuai kebutuhanmu
        </p>
      </div>

      {/* Appearance */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#6366f115' }}>
              <Palette size={14} style={{ color: '#6366f1' }} />
            </div>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Tampilan</h2>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Theme */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Tema</p>
            <div
              className="flex p-1 rounded-2xl"
              style={{ background: 'var(--bg-primary)' }}
            >
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ theme: value })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={
                    settings.theme === value
                      ? { background: 'var(--bg-card)', color: 'var(--accent)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Warna Aksen</p>
            <div className="flex gap-3 flex-wrap">
              {accentColors.map((ac) => (
                <button
                  key={ac.value}
                  onClick={() => updateSettings({ accentColor: ac.value })}
                  className="flex flex-col items-center gap-1"
                  title={ac.label}
                >
                  <div
                    className="w-9 h-9 rounded-2xl transition-all"
                    style={{
                      background: ac.color,
                      border: settings.accentColor === ac.value ? '3px solid var(--text-primary)' : '3px solid transparent',
                      transform: settings.accentColor === ac.value ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ac.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily quote toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Quote Harian</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Tampilkan inspirasi di dashboard</p>
            </div>
            <button
              onClick={() => updateSettings({ dailyQuoteEnabled: !settings.dailyQuoteEnabled })}
              className="relative w-12 h-6 rounded-full transition-all"
              style={{ background: settings.dailyQuoteEnabled ? 'var(--accent)' : 'var(--border)' }}
            >
              <div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: settings.dailyQuoteEnabled ? '26px' : '4px' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#10b98115' }}>
              <Shield size={14} style={{ color: '#10b981' }} />
            </div>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Keamanan</h2>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Kunci PIN</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {settings.pinEnabled ? 'PIN aktif' : 'Lindungi data dengan PIN'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {settings.pinEnabled && (
                <button
                  onClick={() => { updateSettings({ pinEnabled: false, pin: '' }); toast.success('PIN dinonaktifkan'); }}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: '#fee2e2', color: '#ef4444' }}
                >
                  Hapus
                </button>
              )}
              <button
                onClick={() => setShowPinSetup(true)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {settings.pinEnabled ? 'Ganti PIN' : 'Atur PIN'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#f59e0b15' }}>
              <Database size={14} style={{ color: '#f59e0b' }} />
            </div>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Manajemen Data</h2>
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {/* Data stats */}
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Transaksi', value: transactions.length, icon: '📊' },
                { label: 'Budget', value: budgets.length, icon: '🎯' },
                { label: 'Target', value: savingsGoals.length, icon: '🏦' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl text-center"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {[
            {
              icon: Download,
              label: 'Ekspor Data',
              desc: 'Backup semua data ke file JSON',
              color: '#10b981',
              action: handleExport,
            },
            {
              icon: Upload,
              label: 'Impor Data',
              desc: 'Restore dari file backup',
              color: '#3b82f6',
              action: handleImport,
            },
            {
              icon: CheckCircle,
              label: 'Muat Demo Data',
              desc: 'Isi dengan data contoh',
              color: '#8b5cf6',
              action: handleLoadDemo,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center justify-between px-5 py-4 transition-all"
                style={{ color: 'var(--text-primary)' }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-primary)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            );
          })}

          {/* Danger zone */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-between px-5 py-4 transition-all"
            onMouseOver={(e) => (e.currentTarget.style.background = '#fee2e2')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fee2e2' }}>
                <RotateCcw size={16} className="text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm text-red-500">Reset Semua Data</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Hapus semua transaksi dan data</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* About */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              💚
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>MoneyFlow</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Premium Finance Tracker</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>Versi 1.0.0</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-2xl" style={{ background: 'var(--bg-primary)' }}>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              💚 Offline-First • 🔒 Data Lokal • ⚡ Tanpa Internet • 🚀 Gratis Selamanya
            </p>
          </div>
        </div>
      </div>

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div
            className="relative w-full max-w-sm rounded-3xl p-6 animate-scale-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Reset Semua Data?
              </h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Semua transaksi, budget, dan target tabungan akan dihapus permanent. Aksi ini tidak bisa dibatalkan!
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="flex-1 btn-danger"
              >
                <Trash2 size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN setup modal */}
      {showPinSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPinSetup(false)} />
          <div
            className="relative w-full max-w-sm rounded-3xl p-6 animate-scale-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {settings.pinEnabled ? 'Ganti PIN' : 'Atur PIN'}
              </h3>
              <button onClick={() => setShowPinSetup(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>PIN Baru (4-6 digit)</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••"
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
                    className="input-base pr-12 text-center text-2xl tracking-widest font-bold"
                  />
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Konfirmasi PIN</label>
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••"
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                  className="input-base text-center text-2xl tracking-widest font-bold"
                />
              </div>
              <button onClick={handleSavePin} className="w-full btn-primary py-3">
                <Shield size={16} />
                Simpan PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
