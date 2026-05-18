import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Transaction } from '../../types';
import { formatCurrency, formatRelativeDate, PAYMENT_METHODS } from '../../utils/helpers';
import { Trash2, Edit2, Copy, MoreHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (tx: Transaction) => void;
  compact?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, compact }) => {
  const { categories, deleteTransaction, duplicateTransaction } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  const category = categories.find((c) => c.id === transaction.categoryId);
  const isIncome = transaction.type === 'income';
  const payment = PAYMENT_METHODS.find((p) => p.value === transaction.paymentMethod);

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    setShowMenu(false);
    toast.success('Transaksi dihapus');
  };

  const handleDuplicate = () => {
    duplicateTransaction(transaction.id);
    setShowMenu(false);
    toast.success('Transaksi diduplikasi');
  };

  const handleEdit = () => {
    onEdit?.(transaction);
    setShowMenu(false);
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-2xl transition-all group hover:shadow-sm relative"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Category icon */}
      <div
        className={`flex-shrink-0 ${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-105`}
        style={{
          background: category ? `${category.color}15` : '#6b728015',
          border: `1.5px solid ${category?.color || '#6b7280'}25`,
        }}
      >
        {category?.icon || '📦'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="font-semibold text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {category?.name || 'Lainnya'}
          </p>
          {!compact && payment && (
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-muted)',
              }}
            >
              {payment.icon} {payment.label}
            </span>
          )}
        </div>
        <p
          className="text-xs truncate mt-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {transaction.notes || formatRelativeDate(transaction.date)}
          {transaction.notes && !compact && ` · ${formatRelativeDate(transaction.date)}`}
        </p>
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p
          className="font-bold text-sm"
          style={{ color: isIncome ? '#10b981' : '#ef4444' }}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, true)}
        </p>
        {!compact && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {transaction.time}
          </p>
        )}
      </div>

      {/* Action menu button */}
      <div className="flex-shrink-0 relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--text-muted)' }}
        >
          <MoreHorizontal size={16} />
        </button>

        {/* Context menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div
              className="absolute right-0 top-9 z-50 w-44 rounded-2xl shadow-xl overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all"
                style={{ color: 'var(--text-primary)' }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-primary)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all"
                style={{ color: 'var(--text-primary)' }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-primary)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Copy size={14} />
                Duplikat
              </button>
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-red-500"
                onMouseOver={(e) => (e.currentTarget.style.background = '#fee2e2')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={14} />
                Hapus
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
