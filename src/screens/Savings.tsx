import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { SavingsGoal } from '../types';
import { formatCurrency, formatDate, CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/helpers';
import { Plus, Trash2, Edit2, X, Target, Calendar, Check, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, differenceInDays, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const Savings: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addToSavingsGoal } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏖️');
  const [selectedColor, setSelectedColor] = useState('#10b981');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatAmountDisplay = (val: string) =>
    val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const handleAmountChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '');
    if (/^\d*$/.test(raw)) setter(raw);
  };

  const openAddModal = () => {
    setEditGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline(format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
    setSelectedIcon('🏖️');
    setSelectedColor('#10b981');
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline);
    setSelectedIcon(goal.icon);
    setSelectedColor(goal.color);
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nama target diperlukan';
    if (!targetAmount || parseInt(targetAmount) <= 0) errs.target = 'Nominal target harus lebih dari 0';
    if (!deadline) errs.deadline = 'Tentukan deadline';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editGoal) {
      updateSavingsGoal(editGoal.id, {
        name: name.trim(),
        targetAmount: parseInt(targetAmount),
        currentAmount: parseInt(currentAmount) || editGoal.currentAmount,
        deadline,
        icon: selectedIcon,
        color: selectedColor,
      });
      toast.success('Target diperbarui ✅');
    } else {
      addSavingsGoal({
        name: name.trim(),
        targetAmount: parseInt(targetAmount),
        currentAmount: parseInt(currentAmount) || 0,
        deadline,
        icon: selectedIcon,
        color: selectedColor,
        history: [],
      });
      toast.success('Target tabungan dibuat! 🎯');
    }
    setShowModal(false);
  };

  const handleAddFunds = (goalId: string) => {
    const amount = parseInt(addFundsAmount.replace(/\./g, ''));
    if (!amount || amount <= 0) {
      toast.error('Masukkan nominal yang valid');
      return;
    }
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    addToSavingsGoal(goalId, amount);

    const newCurrent = goal.currentAmount + amount;
    if (newCurrent >= goal.targetAmount) {
      setCelebrateId(goalId);
      setTimeout(() => setCelebrateId(null), 4000);
      toast.success('🎉 Target tercapai! Selamat!', { duration: 4000 });
    } else {
      toast.success(`+${formatCurrency(amount, true)} ditambahkan 💰`);
    }

    setAddFundsAmount('');
    setShowAddFundsModal(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Celebration overlay */}
      {celebrateId && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="text-center animate-bounce-in">
            <div className="text-8xl">🎉</div>
            <p className="text-2xl font-bold text-white mt-4">Target Tercapai!</p>
          </div>
          {/* Confetti */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Target Tabungan</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {savingsGoals.length} target aktif
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} />
          <span className="hidden sm:block">Tambah Target</span>
        </button>
      </div>

      {/* Summary */}
      {savingsGoals.length > 0 && (
        <div
          className="p-5 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Total Ditabung',
                value: formatCurrency(savingsGoals.reduce((s, g) => s + g.currentAmount, 0), true),
              },
              {
                label: 'Total Target',
                value: formatCurrency(savingsGoals.reduce((s, g) => s + g.targetAmount, 0), true),
              },
              {
                label: 'Target Aktif',
                value: `${savingsGoals.length}`,
              },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xl font-bold text-white">{item.value}</div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals list */}
      {savingsGoals.length === 0 ? (
        <div
          className="p-12 rounded-3xl flex flex-col items-center gap-3 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl">🏦</div>
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Belum Ada Target Tabungan
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Buat target dan mulai menabung secara konsisten
          </p>
          <button onClick={openAddModal} className="btn-primary mt-2">
            <Plus size={16} /> Buat Target Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {savingsGoals.map((goal) => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = pct >= 100;
            const daysLeft = differenceInDays(parseISO(goal.deadline), new Date());
            const isCelebrating = celebrateId === goal.id;

            return (
              <div
                key={goal.id}
                className={`p-5 rounded-3xl hover-lift transition-all ${isCelebrating ? 'neon-glow' : ''}`}
                style={{ background: 'var(--bg-card)', border: `1px solid ${isCompleted ? goal.color : 'var(--border)'}` }}
              >
                {/* Goal header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: `${goal.color}15` }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {goal.name}
                        </p>
                        {isCompleted && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: '#d1fae5', color: '#059669' }}
                          >
                            ✅ Tercapai!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: daysLeft < 0 ? '#ef4444' : 'var(--text-muted)' }}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlewat` : daysLeft === 0 ? 'Hari ini deadline!' : `${daysLeft} hari lagi`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => { deleteSavingsGoal(goal.id); toast.success('Target dihapus'); }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: '#fee2e2', color: '#ef4444' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(goal.currentAmount, true)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      dari {formatCurrency(goal.targetAmount, true)}
                    </p>
                  </div>
                  <div
                    className="text-right px-3 py-1.5 rounded-xl"
                    style={{ background: `${goal.color}15` }}
                  >
                    <p className="text-xl font-bold" style={{ color: goal.color }}>
                      {pct.toFixed(0)}%
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>tercapai</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-bar mb-4" style={{ height: '10px' }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: goal.color, height: '10px' }}
                  />
                </div>

                {/* Sisa */}
                {!isCompleted && (
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    💡 Perlu {formatCurrency(goal.targetAmount - goal.currentAmount, true)} lagi
                  </p>
                )}

                {/* Add funds button */}
                {!isCompleted ? (
                  <button
                    onClick={() => setShowAddFundsModal(goal.id)}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ background: `${goal.color}15`, color: goal.color }}
                    onMouseOver={(e) => (e.currentTarget.style.background = goal.color) && (e.currentTarget.style.color = 'white')}
                    onMouseOut={(e) => { e.currentTarget.style.background = `${goal.color}15`; e.currentTarget.style.color = goal.color; }}
                  >
                    <Plus size={14} />
                    Tambah Dana
                  </button>
                ) : (
                  <div
                    className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ background: '#d1fae5', color: '#059669' }}
                  >
                    <Gift size={14} />
                    Target Tercapai! 🎉
                  </div>
                )}

                {/* Add funds modal inline */}
                {showAddFundsModal === goal.id && (
                  <div className="mt-3 p-3 rounded-2xl animate-fade-in" style={{ background: 'var(--bg-primary)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                      Tambah berapa?
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={formatAmountDisplay(addFundsAmount)}
                          onChange={handleAmountChange(setAddFundsAmount)}
                          className="input-base pl-10 py-2 text-sm"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => handleAddFunds(goal.id)}
                        className="px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-1"
                        style={{ background: goal.color, color: 'white' }}
                      >
                        <Check size={14} />
                        OK
                      </button>
                      <button
                        onClick={() => { setShowAddFundsModal(null); setAddFundsAmount(''); }}
                        className="px-3 py-2 rounded-xl text-sm"
                        style={{ background: 'var(--border)', color: 'var(--text-muted)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-y-auto animate-scale-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '90vh' }}
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editGoal ? 'Edit Target' : 'Target Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Nama Target</label>
                <input
                  type="text"
                  placeholder="Liburan Bali, Laptop Baru..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-base"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Ikon</label>
                <div className="grid grid-cols-9 gap-1 max-h-28 overflow-y-auto">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                      style={
                        selectedIcon === icon
                          ? { background: 'var(--accent-light)', border: '2px solid var(--accent)' }
                          : { background: 'var(--bg-primary)', border: '2px solid transparent' }
                      }
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Warna</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-8 h-8 rounded-xl transition-all"
                      style={{
                        background: color,
                        border: selectedColor === color ? '3px solid var(--text-primary)' : '3px solid transparent',
                        transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Nominal Target</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formatAmountDisplay(targetAmount)}
                      onChange={handleAmountChange(setTargetAmount)}
                      className="input-base pl-9 font-bold"
                    />
                  </div>
                  {errors.target && <p className="text-red-500 text-xs mt-1">{errors.target}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Sudah Ditabung</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formatAmountDisplay(currentAmount)}
                      onChange={handleAmountChange(setCurrentAmount)}
                      className="input-base pl-9 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-base"
                />
                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
              </div>

              <button onClick={handleSave} className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2" style={{ background: selectedColor }}>
                <Target size={18} />
                {editGoal ? 'Simpan Perubahan' : 'Buat Target'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
