import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Transaction } from '../../types';
import { X, Check, ChevronDown } from 'lucide-react';
import { PAYMENT_METHODS, CATEGORY_ICONS, CATEGORY_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
  defaultType?: 'income' | 'expense';
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
  defaultType = 'expense',
}) => {
  const { categories, addTransaction, updateTransaction } = useStore();

  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('cash');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  );

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCategoryId(editTransaction.categoryId);
      setDate(editTransaction.date);
      setTime(editTransaction.time);
      setNotes(editTransaction.notes);
      setPaymentMethod(editTransaction.paymentMethod);
    } else {
      resetForm();
    }
  }, [editTransaction, isOpen]);

  useEffect(() => {
    if (!editTransaction) {
      setCategoryId(filteredCategories[0]?.id || '');
    }
  }, [type]);

  const resetForm = () => {
    setType(defaultType);
    setAmount('');
    setCategoryId(filteredCategories[0]?.id || '');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime(format(new Date(), 'HH:mm'));
    setNotes('');
    setPaymentMethod('cash');
    setErrors({});
  };

  const formatAmountDisplay = (val: string): string => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '');
    if (/^\d*$/.test(raw)) {
      setAmount(raw);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!amount || parseInt(amount) <= 0) {
      newErrors.amount = 'Nominal harus lebih dari 0';
    }
    if (!categoryId) {
      newErrors.category = 'Pilih kategori';
    }
    if (!date) {
      newErrors.date = 'Pilih tanggal';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const txData = {
      type,
      amount: parseInt(amount),
      categoryId,
      date,
      time,
      notes,
      paymentMethod,
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, txData);
      toast.success('Transaksi diperbarui! ✅');
    } else {
      addTransaction(txData);
      toast.success(
        type === 'income' ? 'Pemasukan ditambahkan! 💰' : 'Pengeluaran dicatat! 📝'
      );
    }

    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale-in"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {editTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type toggle */}
          <div
            className="flex p-1 rounded-2xl"
            style={{ background: 'var(--bg-primary)' }}
          >
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={
                  type === t
                    ? {
                        background: t === 'income' ? '#10b981' : '#ef4444',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }
                    : { color: 'var(--text-muted)' }
                }
              >
                {t === 'income' ? '💰 Pemasukan' : '💸 Pengeluaran'}
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Nominal
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatAmountDisplay(amount)}
                onChange={handleAmountChange}
                className="input-base pl-12 text-xl font-bold"
                style={{
                  fontSize: '20px',
                  color: type === 'income' ? '#10b981' : '#ef4444',
                }}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Kategori
            </label>
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all"
                  style={{
                    background:
                      categoryId === cat.id
                        ? `${cat.color}15`
                        : 'var(--bg-primary)',
                    border:
                      categoryId === cat.id
                        ? `2px solid ${cat.color}`
                        : '2px solid transparent',
                  }}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span
                    className="text-xs font-medium text-center leading-tight"
                    style={{
                      color:
                        categoryId === cat.id
                          ? cat.color
                          : 'var(--text-muted)',
                    }}
                  >
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Waktu
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  onClick={() =>
                    setPaymentMethod(pm.value as Transaction['paymentMethod'])
                  }
                  className="flex items-center gap-2 p-3 rounded-xl text-sm transition-all"
                  style={{
                    background:
                      paymentMethod === pm.value
                        ? 'var(--accent-light)'
                        : 'var(--bg-primary)',
                    border:
                      paymentMethod === pm.value
                        ? '1.5px solid var(--accent)'
                        : '1.5px solid transparent',
                    color:
                      paymentMethod === pm.value
                        ? 'var(--accent)'
                        : 'var(--text-muted)',
                  }}
                >
                  <span>{pm.icon}</span>
                  <span className="text-xs font-medium truncate">{pm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Catatan (Opsional)
            </label>
            <textarea
              placeholder="Tambahkan catatan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-base resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: type === 'income' ? '#10b981' : '#ef4444',
              boxShadow: type === 'income'
                ? '0 4px 15px rgba(16,185,129,0.4)'
                : '0 4px 15px rgba(239,68,68,0.4)',
            }}
          >
            <Check size={18} />
            {editTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
