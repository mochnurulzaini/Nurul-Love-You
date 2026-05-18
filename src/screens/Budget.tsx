import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Budget } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Plus, Trash2, Edit2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const Budget: React.FC = () => {
  const { categories, budgets, transactions, addBudget, updateBudget, deleteBudget } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthlyBudgets = useMemo(
    () => budgets.filter((b) => b.month === currentMonth),
    [budgets, currentMonth]
  );

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense' || c.type === 'both'),
    [categories]
  );

  const budgetWithUsage = useMemo(() => {
    return monthlyBudgets.map((b) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
      const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      return { ...b, spent, pct };
    });
  }, [monthlyBudgets, transactions, currentMonth]);

  const totalBudget = monthlyBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgetWithUsage.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const existingCategoryIds = monthlyBudgets.map((b) => b.categoryId);
  const availableCategories = expenseCategories.filter(
    (c) => !existingCategoryIds.includes(c.id) || editBudget?.categoryId === c.id
  );

  const openAddModal = () => {
    setEditBudget(null);
    setSelectedCategoryId(availableCategories[0]?.id || '');
    setAmount('');
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (b: Budget) => {
    setEditBudget(b);
    setSelectedCategoryId(b.categoryId);
    setAmount(b.amount.toString());
    setErrors({});
    setShowModal(true);
  };

  const formatAmountDisplay = (val: string) =>
    val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '');
    if (/^\d*$/.test(raw)) setAmount(raw);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedCategoryId) errs.category = 'Pilih kategori';
    if (!amount || parseInt(amount) <= 0) errs.amount = 'Nominal harus lebih dari 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editBudget) {
      updateBudget(editBudget.id, { categoryId: selectedCategoryId, amount: parseInt(amount) });
      toast.success('Budget diperbarui ✅');
    } else {
      addBudget({ categoryId: selectedCategoryId, amount: parseInt(amount), month: currentMonth });
      toast.success('Budget ditambahkan 🎯');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteBudget(id);
    toast.success('Budget dihapus');
  };

  const getStatusColor = (pct: number) => {
    if (pct >= 100) return '#ef4444';
    if (pct >= 80) return '#f59e0b';
    return '#10b981';
  };

  const getStatusIcon = (pct: number) => {
    if (pct >= 100) return <AlertTriangle size={14} className="text-red-500" />;
    if (pct >= 80) return <AlertTriangle size={14} className="text-amber-500" />;
    return <CheckCircle size={14} style={{ color: '#10b981' }} />;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Budget</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(), 'MMMM yyyy', { locale: idLocale })}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary"
          disabled={availableCategories.length === 0}
        >
          <Plus size={16} />
          <span className="hidden sm:block">Tambah Budget</span>
        </button>
      </div>

      {/* Overall budget summary */}
      {totalBudget > 0 && (
        <div
          className="p-5 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Total Budget Bulanan
          </p>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-white">{formatCurrency(totalBudget)}</div>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Terpakai: {formatCurrency(totalSpent, true)} ({totalPct.toFixed(0)}%)
              </p>
            </div>
            <div className="text-right">
              <div
                className="text-xl font-bold"
                style={{ color: totalPct >= 100 ? '#ef4444' : '#10b981' }}
              >
                {formatCurrency(Math.max(0, totalBudget - totalSpent), true)}
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Sisa</p>
            </div>
          </div>
          <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(totalPct, 100)}%`,
                background: totalPct >= 100 ? '#ef4444' : totalPct >= 80 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
          {totalPct >= 80 && (
            <div className="flex items-center gap-2 mt-3">
              <AlertTriangle size={12} style={{ color: totalPct >= 100 ? '#ef4444' : '#f59e0b' }} />
              <p
                className="text-xs font-medium"
                style={{ color: totalPct >= 100 ? '#ef4444' : '#f59e0b' }}
              >
                {totalPct >= 100 ? 'Budget telah melebihi batas!' : 'Budget hampir habis!'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Budget list */}
      {budgetWithUsage.length === 0 ? (
        <div
          className="p-12 rounded-3xl flex flex-col items-center gap-3 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl">🎯</div>
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Belum Ada Budget
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Buat budget untuk mengontrol pengeluaranmu
          </p>
          <button onClick={openAddModal} className="btn-primary mt-2">
            <Plus size={16} /> Buat Budget Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgetWithUsage.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId);
            const statusColor = getStatusColor(b.pct);

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl hover-lift"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                      style={{ background: cat ? `${cat.color}15` : '#6b728015' }}
                    >
                      {cat?.icon || '📦'}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {cat?.name || 'Kategori'}
                      </p>
                      <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {getStatusIcon(b.pct)}
                        {b.pct >= 100 ? 'Melebihi batas' : b.pct >= 80 ? 'Hampir habis' : 'Aman'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: '#fee2e2', color: '#ef4444' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="progress-bar mb-2">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(b.pct, 100)}%`, background: statusColor }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold" style={{ color: statusColor }}>
                      {formatCurrency(b.spent, true)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      dari {formatCurrency(b.amount, true)}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${statusColor}15`,
                      color: statusColor,
                    }}
                  >
                    {b.pct.toFixed(0)}%
                  </span>
                </div>

                {b.pct >= 100 && (
                  <div
                    className="mt-2 p-2 rounded-xl flex items-center gap-2"
                    style={{ background: '#fee2e215', border: '1px solid #fee2e2' }}
                  >
                    <AlertTriangle size={12} className="text-red-500" />
                    <span className="text-xs text-red-500 font-medium">
                      Melebihi budget {formatCurrency(b.spent - b.amount, true)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div
            className="relative w-full max-w-md rounded-3xl p-6 space-y-5 animate-scale-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editBudget ? 'Edit Budget' : 'Tambah Budget'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Kategori
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                    style={{
                      background: selectedCategoryId === cat.id ? `${cat.color}15` : 'var(--bg-primary)',
                      border: selectedCategoryId === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                    }}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-center" style={{ color: selectedCategoryId === cat.id ? cat.color : 'var(--text-muted)' }}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Batas Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatAmountDisplay(amount)}
                  onChange={handleAmountChange}
                  className="input-base pl-12 text-lg font-bold"
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <button onClick={handleSave} className="w-full btn-primary py-3">
              <Plus size={16} />
              {editBudget ? 'Simpan Perubahan' : 'Buat Budget'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
